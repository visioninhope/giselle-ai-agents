"use server";

import { blueprints, db } from "@/drizzle";
import { eq } from "drizzle-orm";

export const getGraphToDb = async (blueprintId: number) => {
	const [blueprint] = await db
		.select()
		.from(blueprints)
		.where(eq(blueprints.id, blueprintId));
	return blueprint.graph;
};
