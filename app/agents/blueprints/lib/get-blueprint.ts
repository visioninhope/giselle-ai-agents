"use server";
import type { Blueprint } from "@/app/agents/blueprints";
import {
	agents as agentsSchema,
	blueprints as blueprintsSchema,
	db,
	edgesBlueprints as edgeBlueprintsSchema,
	edges as edgesSchema,
	nodesBlueprints as nodeBlueprintsSchema,
	nodes as nodesSchema,
} from "@/drizzle";
import * as schema from "@/drizzle/schema";
import { asc, desc, eq, inArray } from "drizzle-orm";
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
		.where(eq(blueprintsSchema.id, blueprintId))
		.orderBy(desc(blueprintsSchema.version))
		.limit(1);

	const dbNodes = await db
		.select({
			id: nodesSchema.id,
			className: nodesSchema.className,
			position: nodesSchema.position,
		})
		.from(nodesSchema)
		.innerJoin(
			nodeBlueprintsSchema,
			eq(nodeBlueprintsSchema.nodeId, nodesSchema.id),
		)
		.where(eq(nodeBlueprintsSchema.blueprintId, blueprint.id));
	const ports =
		dbNodes.length === 0
			? []
			: await db.query.ports.findMany({
					where: inArray(
						schema.ports.nodeId,
						dbNodes.map((node) => node.id),
					),
					orderBy: asc(schema.ports.order),
				});
	const nodes = dbNodes.map((node) => {
		const inputPorts = ports.filter(
			({ nodeId, direction }) => nodeId === node.id && direction === "input",
		);
		const outputPorts = ports.filter(
			({ nodeId, direction }) => nodeId === node.id && direction === "output",
		);
		return {
			...node,
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
		.innerJoin(
			edgeBlueprintsSchema,
			eq(edgeBlueprintsSchema.edgeId, edgesSchema.id),
		)
		.where(eq(edgeBlueprintsSchema.blueprintId, blueprint.id));
	const edges = dbEdges.map((edge) => {
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
	};
};
