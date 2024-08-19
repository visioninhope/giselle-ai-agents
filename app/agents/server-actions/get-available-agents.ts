"use server";

import { agents, blueprints, db, nodes, ports, requests } from "@/drizzle";
import { and, eq, exists, isNotNull, max, sql } from "drizzle-orm";

type Port = {
	name: string;
};
export type AvailableAgent = {
	id: number;
	name: string;
	blueprintId: number;
	inputPorts: Port[];
};
export const getAvailableAgents = async (): Promise<AvailableAgent[]> => {
	const availableAgentsQuery = db
		.select({
			agentId: blueprints.agentId,
			latestBlueprintId: max(blueprints.id).as("latestBlueprintId"),
		})
		.from(requests)
		.innerJoin(blueprints, eq(blueprints.id, requests.blueprintId))
		.innerJoin(
			agents,
			and(eq(agents.id, blueprints.agentId), isNotNull(agents.name)),
		)
		.where(eq(requests.status, "success"))
		.groupBy(blueprints.agentId)
		.as("availableAgentsQuery");

	const availableAgentInputPorts = await db
		.select({
			agentId: availableAgentsQuery.agentId,
			id: ports.id,
			type: ports.type,
			name: ports.name,
		})
		.from(ports)
		.innerJoin(
			nodes,
			and(eq(nodes.id, ports.nodeId), eq(nodes.className, "onRequest")),
		)
		.innerJoin(
			availableAgentsQuery,
			eq(availableAgentsQuery.latestBlueprintId, nodes.blueprintId),
		)
		.where(and(eq(ports.direction, "output"), eq(ports.type, "data")));

	const portGroupsByAgentId = availableAgentInputPorts.reduce(
		(acc: { [key: number]: Port[] }, port) => {
			if (!acc[port.agentId]) {
				acc[port.agentId] = [];
			}
			acc[port.agentId].push(port);
			return acc;
		},
		{},
	);

	const availableAgents = await db
		.select({
			id: agents.id,
			name: agents.name,
			blueprintId: availableAgentsQuery.latestBlueprintId,
		})
		.from(agents)
		.innerJoin(
			availableAgentsQuery,
			eq(agents.id, availableAgentsQuery.agentId),
		);
	return availableAgents.map(({ blueprintId, name, ...agent }) => ({
		...agent,
		name: name ?? "",
		blueprintId: blueprintId as number,
		inputPorts: portGroupsByAgentId[agent.id] ?? [],
	}));
};
