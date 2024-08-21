"use server";

import type { Node } from "@/app/agents/blueprints";
import { leaveMessage } from "@/app/agents/requests";
import {
	db,
	files,
	knowledgeContentOpenaiVectorStoreFileRepresentations,
	knowledgeContents,
	knowledgeOpenaiVectorStoreRepresentations,
	knowledges as knowledgesSchema,
	pullMessages,
} from "@/drizzle";
import { openai } from "@/lib/openai";
import type { Knowledge } from "@/services/knowledges";
import { and, eq, inArray } from "drizzle-orm";
import type { Message } from "openai/resources/beta/threads/messages.mjs";
import { match } from "ts-pattern";
import { retrivalInstructions } from "./prompts";

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = (value) => {};

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

const prepareVectorStores = async (knowledges: Knowledge[]) => {
	for (const knowledge of knowledges) {
		const vectorStore = await openai.beta.vectorStores.retrieve(
			knowledge.openaiVectorStoreId,
		);
		await match(vectorStore.status)
			.with("completed", () => {})
			.with("in_progress", async () => {
				/** @todo ensure to complete */
				await new Promise((resolve) => setTimeout(resolve, 1000));
			})
			.with("expired", async () => {
				await db
					.update(knowledgeOpenaiVectorStoreRepresentations)
					.set({
						status: "expired",
					})
					.where(
						eq(
							knowledgeOpenaiVectorStoreRepresentations.knowledgeId,
							knowledge.id,
						),
					);
				const newVectorStore = await openai.beta.vectorStores.create({
					name: knowledge.name,
					expires_after: {
						anchor: "last_active_at",
						days: 1,
					},
				});
				await db.insert(knowledgeOpenaiVectorStoreRepresentations).values({
					knowledgeId: knowledge.id,
					openaiVectorStoreId: newVectorStore.id,
					status: newVectorStore.status,
				});
				await Promise.all(
					knowledge.contents.map(async ({ file, id }) => {
						const newVectorStoreFile =
							await openai.beta.vectorStores.files.createAndPoll(
								newVectorStore.id,
								{
									file_id: file.openaiFileId,
								},
							);
						await db
							.update(knowledgeContentOpenaiVectorStoreFileRepresentations)
							.set({
								openaiVectorStoreFileId: newVectorStoreFile.id,
							})
							.where(
								eq(
									knowledgeContentOpenaiVectorStoreFileRepresentations.knowledgeContentId,
									id,
								),
							);
					}),
				);
			})
			.exhaustive();
	}
};

type RetrievalArgs = {
	node: Node;
	openaiAssistantId: string;
	knowledges: Knowledge[];
	queryPortId: number;
	requestId: number;
	resultPortId: number;
};
export const retrieval = async (args: RetrievalArgs) => {
	await prepareVectorStores(args.knowledges);
	await openai.beta.assistants.update(args.openaiAssistantId, {
		instructions: retrivalInstructions,
		tools: [{ type: "file_search" }],
		tool_resources: {
			file_search: {
				vector_store_ids: args.knowledges.map(
					({ openaiVectorStoreId }) => openaiVectorStoreId,
				),
			},
		},
	});

	const [queryMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, args.requestId),
				eq(pullMessages.nodeId, args.node.id),
				eq(pullMessages.portId, args.queryPortId),
			),
		);
	const content = queryMessage.content;
	asssertContent(content);
	const thread = await openai.beta.threads.create({
		messages: [
			{
				role: "user",
				content,
			},
		],
	});
	const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
		assistant_id: args.openaiAssistantId,
	});
	const messagesPage = await openai.beta.threads.messages.list(run.thread_id, {
		order: "desc",
		limit: 1,
	});
	const lastMessage = messagesPage.data[0];
	const text = messageToText(lastMessage);

	await leaveMessage({
		requestId: args.requestId,
		portId: args.resultPortId,
		message: text,
	});
};
