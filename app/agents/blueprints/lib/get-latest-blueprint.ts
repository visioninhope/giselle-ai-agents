"use server";

import { agents, blueprints, db } from "@/drizzle";
import { desc, eq } from "drizzle-orm";

export const getLatestBlueprint = async (agentUrlId: string) => {
	const [blueprint] = await db
		.select({
			id: blueprints.id,
			version: blueprints.version,
			dirty: blueprints.dirty,
			builded: blueprints.builded,
			agentId: blueprints.agentId,
		})
		.from(blueprints)
		.innerJoin(agents, eq(agents.id, blueprints.agentId))
		.where(eq(agents.urlId, agentUrlId))
		.orderBy(desc(blueprints.version))
		.limit(1);
	return blueprint;
};
