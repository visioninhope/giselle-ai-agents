import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import { and, asc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
import invariant from "tiny-invariant";
import * as schema from "./schema";
import {
	runDataKnotMessages,
	runSteps,
	runs,
	stepDataKnots as stepDataKnotsSchema,
	stepStrands as stepStrandsSchema,
} from "./schema";

export const db = drizzle(sql, { schema });

export const getWorkflows = async () => {
	return db.query.workspaces.findMany();
};

export type WorkspaceWithNodeAndEdge = Awaited<
	ReturnType<typeof findWorkspaceBySlug>
>;
export type EdgeWithPort = WorkspaceWithNodeAndEdge["edges"][0];
export type NodeWithPort = WorkspaceWithNodeAndEdge["nodes"][0];
export const findWorkspaceBySlug = async (slug: string) => {
	const workflow = await db.query.workspaces.findFirst({
		where: eq(schema.workspaces.slug, slug),
	});
	invariant(workflow != null, "Workflow not found");
	const originalNodes = await db.query.nodes.findMany({
		columns: {
			id: true,
			type: true,
			position: true,
		},
		where: eq(schema.nodes.workspaceId, workflow.id),
	});
	const ports = await db.query.ports.findMany({
		where: inArray(
			schema.ports.nodeId,
			originalNodes.map((node) => node.id),
		),
		orderBy: asc(schema.ports.order),
	});
	const nodes = originalNodes.map((node) => {
		const inputPorts = ports.filter(
			({ nodeId, direction }) => nodeId === node.id && direction === "input",
		);
		const outputPorts = ports.filter(
			({ nodeId, direction }) => nodeId === node.id && direction === "output",
		);
		return {
			...node,
			inputPorts: inputPorts.map(({ id, name, type }) => ({ id, name, type })),
			outputPorts: outputPorts.map(({ id, name, type }) => ({
				id,
				name,
				type,
			})),
		};
	});
	const originalEdges = await db.query.edges.findMany({
		where: eq(schema.edges.workspaceId, workflow.id),
	});
	const edges = originalEdges.map((edge) => {
		const inputPort = ports.find((port) => port.id === edge.inputPortId);
		const outputPort = ports.find((port) => port.id === edge.outputPortId);
		invariant(inputPort != null, "Input port not found");
		invariant(outputPort != null, "Output port not found");
		return {
			...edge,
			inputPort,
			outputPort,
		};
	});
	return {
		...workflow,
		nodes,
		edges,
	};
};

export const updateRun = async (
	runId: number,
	updateValues: Pick<
		typeof runs.$inferInsert,
		"status" | "startedAt" | "finishedAt"
	>,
) => {
	await db.update(runs).set(updateValues).where(eq(runs.id, runId));
};
export const updateRunStep = async (
	runId: number,
	stepId: number,
	updateValues: Pick<
		typeof runSteps.$inferInsert,
		"status" | "startedAt" | "finishedAt"
	>,
) => {
	await db
		.update(runSteps)
		.set(updateValues)
		.where(and(eq(runSteps.runId, runId), eq(runSteps.stepId, stepId)));
};

export const pullMessage = async (dataKnotId: number, runId: number) => {
	const runDataKnotMessage = await db.query.runDataKnotMessages.findFirst({
		where: and(
			eq(runDataKnotMessages.dataKnotId, dataKnotId),
			eq(runDataKnotMessages.runId, runId),
		),
	});
	const dataKnot = await db.query.dataKnots.findFirst({
		where: eq(schema.dataKnots.id, dataKnotId),
	});
};

type Message = {
	portName: string;
	// biome-ignore lint: lint/suspicious/noExplicitAny
	value: any;
};
export const leaveMessage = async (
	runId: number,
	stepId: number,
	messages: Message[],
) => {
	const stepDataKnots = await db
		.select()
		.from(stepDataKnotsSchema)
		.where(eq(stepDataKnotsSchema.stepId, stepId));
	for (const message of messages) {
		const stepDataKnot = stepDataKnots.find(
			(stepDataKnot) => stepDataKnot.portName === message.portName,
		);
		if (stepDataKnot == null) {
			continue;
		}
		await db.insert(runDataKnotMessages).values({
			runId,
			dataKnotId: stepDataKnot.dataKnotId,
			message: message.value,
		});
	}
};

export const pullMessages = async (runId: number, stepId: number) => {
	return await db
		.select()
		.from(stepStrandsSchema)
		.where(
			and(
				eq(stepStrandsSchema.stepId, stepId),
				eq(stepStrandsSchema.runId, runId),
			),
		);
};
