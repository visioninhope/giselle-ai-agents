import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { asc, desc, eq, inArray } from "drizzle-orm";
import invariant from "tiny-invariant";

/**
 * @todo Get it in a single query by using a view or join
 */
export const getAgentWithLatestBlueprint = async (
	uniqueIdentifyingString: string,
) => {
	const agent = await db.query.agents.findFirst({
		where: eq(schema.agents.urlId, uniqueIdentifyingString),
	});
	invariant(
		agent != null,
		`Agent not found with urlId: ${uniqueIdentifyingString}`,
	);
	const latestBlueprint = await db.query.blueprints.findFirst({
		where: eq(schema.blueprints.agentId, agent.id),
		orderBy: desc(schema.blueprints.version),
	});
	invariant(
		latestBlueprint != null,
		`Blueprint not found for agent: ${agent.id}`,
	);
	return { ...agent, latestBlueprint };
};

/**
 * @todo Get a specific version of the blueprint
 */
export const getBlueprint = async (urlId: string, _version?: number) => {
	const agent = await getAgentWithLatestBlueprint(urlId);
	const originalNodes = await db.query.nodes.findMany({
		columns: {
			id: true,
			type: true,
			position: true,
		},
		where: eq(schema.nodes.blueprintId, agent.latestBlueprint.id),
	});
	const ports =
		originalNodes.length === 0
			? []
			: await db.query.ports.findMany({
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
		where: eq(schema.edges.blueprintId, agent.latestBlueprint.id),
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
		...agent,
		nodes,
		edges,
	};
};
