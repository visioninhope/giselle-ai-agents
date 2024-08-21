"use server";

import type { Node } from "@/app/agents/blueprints";
import { db, files, knowledgeContents } from "@/drizzle";
import { openai } from "@/lib/openai";
import { eq, inArray } from "drizzle-orm";
import type { Message } from "openai/resources/beta/threads/messages.mjs";

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = (value) => {};

const getOrCreateOpenAiAssistant = async (
	node: Node,
	openAiAssistantId: string | null,
) => {
	if (openAiAssistantId != null) {
		return await openai.beta.assistants.retrieve(openAiAssistantId);
	}
	const assistant = await openai.beta.assistants.create({
		model: "gpt-4o-mini",
	});
	await db.insert(nodeExecutingOpenaiAssistants).values({
		nodeId,
		openaiAssistantId: assistant.id,
	});
	return assistant;
};

const messageToText = (message: Message) => {
	let result = "";
	for (const part of message.content) {
		if (part.type === "text") {
			result += part.text.value;
		}
		if (part.type === "image_url") {
			/** @todo */
			result += "🖼";
		}
		if (part.type === "image_file") {
			/** @todo */
			result += "📁";
		}
	}
	return result;
};

type RetrievalArgs = {
	node: Node;
	openAiAssistantId: string;
	knowledgeIds: number[];
};
export const retrieval = async (args: RetrievalArgs) => {
	const assistant = await openai.beta.assistants.retrieve(
		args.openAiAssistantId,
	);
	const dbFiles = await db
		.select({
			blobUrl: files.blobUrl,
			knowledgeId: knowledgeContents.knowledgeId,
		})
		.from(files)
		.innerJoin(knowledgeContents, eq(knowledgeContents.fileId, files.id))
		.where(inArray(knowledgeContents.knowledgeId, args.knowledgeIds));

	const knowledgeFiles: Record<number, (typeof dbFiles)["file"]> = {};
	for (const file of dbFiles) {
		if (!knowledgeFiles[file.knowledgeId]) {
			knowledgeFiles[file.knowledgeId] = [];
		}
		knowledgeFiles[file.knowledgeId].push(file);
	}

	// const openaiAssistant = await getOrCreateOpenAiAssistant(node.id);
	// const messages = await db
	// 	.with(pullMessages)
	// 	.select()
	// 	.from(pullMessages)
	// 	.where(
	// 		and(
	// 			eq(pullMessages.requestId, request.id),
	// 			eq(pullMessages.nodeId, node.id),
	// 		),
	// 	);
	// /** @todo set value to openaiAssistant */
	// const instructionMessage = messages.find(
	// 	({ nodeClassKey }) => nodeClassKey === "instruction",
	// );
	// if (instructionMessage == null) {
	// 	logger.log(
	// 		`instruction message not found in messages: ${JSON.stringify(messages)}`,
	// 	);
	// } else {
	// 	const instructions = instructionMessage.content;
	// 	asssertContent(instructions);
	// 	const thread = await openai.beta.threads.create();
	// 	const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
	// 		assistant_id: openaiAssistant.id,
	// 		instructions,
	// 	});
	// 	const messagesPage = await openai.beta.threads.messages.list(
	// 		run.thread_id,
	// 		{
	// 			order: "desc",
	// 			limit: 1,
	// 		},
	// 	);
	// 	const lastMessage = messagesPage.data[0];
	// 	const text = messageToText(lastMessage);
	// 	await leaveMessage({
	// 		requestId: request.id,
	// 		port: { nodeClassKey: "result" },
	// 		stepId: id,
	// 		message: text,
	// 	});
	// }
};
