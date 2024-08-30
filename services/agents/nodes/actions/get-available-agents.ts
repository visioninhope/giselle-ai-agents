"use server";

import { agents, builds, db, nodes, ports, requests } from "@/drizzle";
import { and, eq, exists, isNotNull, max, sql } from "drizzle-orm";
import { requestStatus } from "../../requests";
import type { Agent } from "../../types";

export const getAvailableAgents = async () => {
	await db.select().from(agents);
	const availableAgentsQuery = db
		.select({
			agentDbId: agents.dbId,
			latestBlueprintDbId: max(builds.dbId).as("latestBlueprintDbId"),
		})
		.from(requests)
		.innerJoin(builds, eq(builds.dbId, requests.dbId))
		.innerJoin(
			agents,
			and(eq(agents.dbId, builds.agentDbId), isNotNull(agents.name)),
		)
		.where(eq(requests.status, requestStatus.completed))
		.groupBy(builds.agentDbId)
		.as("available_agents_query");

	const availableAgents = await db
		.select({
			id: agents.id,
			name: agents.name,
			blueprintId: builds.id,
		})
		.from(agents)
		.innerJoin(
			availableAgentsQuery,
			eq(agents.dbId, availableAgentsQuery.agentDbId),
		)
		.innerJoin(
			builds,
			eq(builds.dbId, availableAgentsQuery.latestBlueprintDbId),
		);

	// const availableAgentInputPorts = await db
	// 	.select({
	// 		agentId: availableAgentsQuery.agentId,
	// 		id: ports.id,
	// 		type: ports.type,
	// 		name: ports.name,
	// 	})
	// 	.from(ports)
	// 	.innerJoin(
	// 		nodes,
	// 		and(eq(nodes.id, ports.nodeId), eq(nodes.className, "onRequest")),
	// 	)
	// 	.innerJoin(
	// 		availableAgentsQuery,
	// 		eq(availableAgentsQuery.latestBlueprintId, nodes.blueprintId),
	// 	)
	// 	.where(and(eq(ports.direction, "output"), eq(ports.type, "data")));

	// const portGroupsByAgentId = availableAgentInputPorts.reduce(
	// 	(acc: { [key: number]: Port[] }, port) => {
	// 		if (!acc[port.agentId]) {
	// 			acc[port.agentId] = [];
	// 		}
	// 		acc[port.agentId].push(port);
	// 		return acc;
	// 	},
	// 	{},
	// );

	// return availableAgents.map(({ blueprintId, name, ...agent }) => ({
	// 	...agent,
	// 	name: name ?? "",
	// 	blueprintId: blueprintId as number,
	// 	inputPorts: portGroupsByAgentId[agent.id] ?? [],
	// }));
};
