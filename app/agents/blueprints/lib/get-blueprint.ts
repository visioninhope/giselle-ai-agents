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
	edgesBlueprints as edgeBlueprintsSchema,
	edges as edgesSchema,
	nodesBlueprints as nodeBlueprintsSchema,
	nodes as nodesSchema,
	portsBlueprints as portBlueprintsSchema,
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
		.where(eq(blueprintsSchema.id, blueprintId))
		.orderBy(desc(blueprintsSchema.version))
		.limit(1);

	const dbNodes = await db
		.select({
			id: nodesSchema.id,
			className: nodesSchema.className,
			position: nodeBlueprintsSchema.position,
			data: nodeBlueprintsSchema.data,
		})
		.from(nodesSchema)
		.innerJoin(
			nodeBlueprintsSchema,
			eq(nodeBlueprintsSchema.nodeId, nodesSchema.id),
		)
		.where(eq(nodeBlueprintsSchema.blueprintId, blueprint.id));
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
						nodeClassKey: portsSchema.nodeClassKey,
						blueprintId: nodeBlueprintsSchema.blueprintId,
						portsBlueprintsId: portBlueprintsSchema.id,
					})
					.from(portsSchema)
					.innerJoin(
						portBlueprintsSchema,
						eq(portBlueprintsSchema.portId, portsSchema.id),
					)
					.innerJoin(
						nodeBlueprintsSchema,
						eq(nodeBlueprintsSchema.id, portBlueprintsSchema.nodesBlueprintsId),
					)
					.where(
						and(
							eq(nodeBlueprintsSchema.blueprintId, blueprint.id),
							inArray(
								portsSchema.nodeId,
								dbNodes.map((node) => node.id),
							),
						),
					);
	const nodes = dbNodes.map(({ className, id, ...node }) => {
		const inputPorts = dbPorts.filter(
			({ nodeId, direction }) => nodeId === id && direction === "input",
		);
		const outputPorts = dbPorts.filter(
			({ nodeId, direction }) => nodeId === id && direction === "output",
		);
		const nodeClass = getNodeClass({ name: className });
		return {
			...node,
			id,
			className: className as NodeClassName,
			inputPorts: inputPorts.map(
				({
					id,
					name,
					type,
					direction,
					order,
					nodeId,
					portsBlueprintsId,
					nodeClassKey,
				}) => ({
					id,
					name,
					type,
					direction,
					order,
					nodeId,
					portsBlueprintsId,
					nodeClassKey,
				}),
			),
			outputPorts: outputPorts.map(
				({
					id,
					name,
					type,
					direction,
					order,
					nodeId,
					portsBlueprintsId,
					nodeClassKey,
				}) => ({
					id,
					name,
					type,
					direction,
					order,
					nodeId,
					portsBlueprintsId,
					nodeClassKey,
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
	};
	const requiredActions = reviewRequiredActions(tmpBlueprint);
	const requestInterface = inferRequestInterface(tmpBlueprint);
	return {
		...tmpBlueprint,
		requiredActions,
		requestInterface,
	};
};
