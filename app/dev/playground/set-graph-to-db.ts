"use server";

import { blueprints, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import type { PlaygroundGraph } from "./types";

export const setGraphToDb = async (
	blueprintId: number,
	graph: PlaygroundGraph,
) => {
	await db
		.update(blueprints)
		.set({ graph })
		.where(eq(blueprints.id, blueprintId));
};
