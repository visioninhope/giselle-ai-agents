"use server";

import type { Node } from "@/app/agents/blueprints";
import { db, nodes } from "@/drizzle";
import { openai } from "@/lib/openai";
import { eq } from "drizzle-orm";
import { parse } from "valibot";
import type { dataSchema } from "./data-schema";

type CreateOpenaiAssistantArgs = {
	node: Node;
	dataSchema: typeof dataSchema;
};
/** @todo Make this implementation durable  */
export const createOpenaiAssistant = async (
	args: CreateOpenaiAssistantArgs,
) => {
	const assistant = await openai.beta.assistants.create({
		model: "gpt-4o-mini",
	});
	const data = parse(args.dataSchema, {
		...args.node.data,
		openaiAssistantId: assistant.id,
	});
	await db
		.update(nodes)
		.set({
			data,
		})
		.where(eq(nodes.id, args.node.id));
};
