"use server";

import {
	agents,
	blueprints,
	db,
	nodes,
	nodesBlueprints,
	ports,
	portsBlueprints,
	requests,
} from "@/drizzle";
import { and, eq, exists, isNotNull, max, sql } from "drizzle-orm";

export type AvailableAgent = {
	id: number;
	name: string;
	blueprintId: number;
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
	}));
};
