"use server";

import { db } from "@/drizzle/db";
import { agents, blueprints } from "@/drizzle/schema";
import { createId } from "@paralleldrive/cuid2";
import { redirect } from "next/navigation";

export const createAgent = async (_: FormData) => {
	const urlId = createId();
	const [agent] = await db
		.insert(agents)
		.values({
			urlId: urlId,
		})
		.returning({
			insertedId: agents.id,
		});
	await db.insert(blueprints).values({
		agentId: agent.insertedId,
		version: 1,
	});
	redirect(`/agents/${urlId}`);
};
