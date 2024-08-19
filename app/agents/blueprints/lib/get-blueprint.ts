"use server";
import {
	type Blueprint,
	inferRequestInterface,
	reviewRequiredActions,
} from "@/app/agents/blueprints";
import {
	agents as agentsSchema,
	blueprints as blueprintsSchema,
	db,
	edges as edgesSchema,
	files,
	knowledgeAffiliations,
	knowledges as knowledgesSchema,
	nodes as nodesSchema,
	ports as portsSchema,
} from "@/drizzle";
import { and, desc, eq, inArray } from "drizzle-orm";
import invariant from "tiny-invariant";

export const getBlueprint = async (blueprintId: number): Promise<Blueprint> => {
	const [blueprint] = await db
		.select({
			id: blueprintsSchema.id,
			version: blueprintsSchema.version,
			dirty: blueprintsSchema.dirty,
			builded: blueprintsSchema.builded,
			agentId: blueprintsSchema.agentId,
			agentUrlId: agentsSchema.urlId,
		})
		.from(blueprintsSchema)
		.innerJoin(agentsSchema, eq(agentsSchema.id, blueprintsSchema.agentId))
		.where(eq(blueprintsSchema.id, blueprintId));

	const dbNodes = await db
		.select({
			id: nodesSchema.id,
			className: nodesSchema.className,
			position: nodesSchema.position,
			data: nodesSchema.data,
		})
		.from(nodesSchema)
		.where(eq(nodesSchema.blueprintId, blueprint.id));
	const dbPorts =
		dbNodes.length === 0
			? []
			: await db
					.select({
						id: portsSchema.id,
						direction: portsSchema.direction,
						nodeId: portsSchema.nodeId,
						name: portsSchema.name,
						type: portsSchema.type,
						order: portsSchema.order,
						blueprintId: nodesSchema.blueprintId,
					})
					.from(portsSchema)
					.innerJoin(nodesSchema, eq(nodesSchema.id, portsSchema.nodeId))
					.where(
						inArray(
							portsSchema.nodeId,
							dbNodes.map((node) => node.id),
						),
					);
	const nodes = dbNodes.map(({ className, id, ...node }) => {
		const inputPorts = dbPorts.filter(
			({ nodeId, direction }) => nodeId === id && direction === "input",
		);
		const outputPorts = dbPorts.filter(
			({ nodeId, direction }) => nodeId === id && direction === "output",
		);
		return {
			...node,
			id,
			className,
			inputPorts: inputPorts.map(
				({ id, name, type, direction, order, nodeId }) => ({
					id,
					name,
					type,
					direction,
					order,
					nodeId,
				}),
			),
			outputPorts: outputPorts.map(
				({ id, name, type, direction, order, nodeId }) => ({
					id,
					name,
					type,
					direction,
					order,
					nodeId,
				}),
			),
		};
	});
	const dbEdges = await db
		.select({
			id: edgesSchema.id,
			edgeType: edgesSchema.edgeType,
			inputPortId: edgesSchema.inputPortId,
			outputPortId: edgesSchema.outputPortId,
		})
		.from(edgesSchema)
		.where(eq(edgesSchema.blueprintId, blueprint.id));
	const edges = dbEdges.map((edge) => {
		const inputPort = dbPorts.find((port) => port.id === edge.inputPortId);
		const outputPort = dbPorts.find((port) => port.id === edge.outputPortId);
		invariant(inputPort != null, "Input port not found");
		invariant(outputPort != null, "Output port not found");
		return {
			...edge,
			inputPort,
			outputPort,
		};
	});
	const dbKnowledges = await db
		.select()
		.from(knowledgesSchema)
		.where(eq(knowledgesSchema.blueprintId, blueprint.id));
	const dbFiles = await db
		.select({
			id: files.id,
			fileName: files.fileName,
			fileType: files.fileType,
			knowledgeId: knowledgeAffiliations.knowledgeId,
		})
		.from(files)
		.innerJoin(
			knowledgeAffiliations,
			eq(knowledgeAffiliations.fileId, files.id),
		)
		.where(
			inArray(
				knowledgeAffiliations.knowledgeId,
				dbKnowledges.map(({ id }) => id),
			),
		);
	const knowledges = dbKnowledges.map(({ id, ...knowledge }) => {
		const files = dbFiles.filter(({ knowledgeId }) => knowledgeId === id);
		return {
			id,
			...knowledge,
			files,
		};
	});
	const filesByKnowledge = dbKnowledges.reduce(
		(acc, knowledge) => {
			acc[knowledge.id] = dbFiles.filter(
				({ knowledgeId }) => knowledgeId === knowledge.id,
			);
			return acc;
		},
		{} as Record<number, typeof dbFiles>,
	);

	const tmpBlueprint: Blueprint = {
		id: blueprint.id,
		agent: {
			id: blueprint.agentId,
			urlId: blueprint.agentUrlId,
		},
		version: blueprint.version,
		dirty: blueprint.dirty,
		builded: blueprint.builded,
		nodes,
		edges,
		knowledges,
	};
	const requiredActions = reviewRequiredActions(tmpBlueprint);
	const requestInterface = inferRequestInterface(tmpBlueprint);
	return {
		...tmpBlueprint,
		requiredActions,
		requestInterface,
	};
};
