// import { type FileNode, isTextGenerationNode } from "@giselle-sdk/data-type";
// import { AssistantResponse } from "ai";
// import type {
// 	AssistantCreateParams,
// 	AssistantTool,
// } from "openai/resources/beta/assistants";
// import type {
// 	RequiredActionFunctionToolCall,
// 	Run,
// } from "openai/resources/beta/threads";
// import type { z } from "zod";
// import { openai } from "../../openai";
// import {
// 	createContextMapFrom,
// 	openaiFunction,
// 	openaiFunctionName,
// 	openaiFunctionParameters,
// } from "../../tools";
// import { getWorkspace } from "../helpers/get-workspace";
// import { runAssistant } from "../schema";
// import type { GiselleEngineHandlerArgs } from "./types";

// const Input = runAssistant.Input;
// type Input = z.infer<typeof Input>;

// function isRequiredActionFunctionToolCall(
// 	args: unknown,
// ): args is RequiredActionFunctionToolCall {
// 	if (typeof args !== "object" || args === null) {
// 		return false;
// 	}
// 	return (args as RequiredActionFunctionToolCall).type === "function";
// }

// function isRun(args: unknown): args is Run {
// 	if (typeof args !== "object" || args === null) {
// 		return false;
// 	}
// 	return (args as Run).object === "thread.run";
// }

// export async function runAssistantHandler({
// 	unsafeInput,
// 	context,
// }: GiselleEngineHandlerArgs<Input>) {
// 	const input = Input.parse(unsafeInput);

// 	const workspace = await getWorkspace({
// 		storage: context.storage,
// 		workspaceId: input.workspaceId,
// 	});
// 	if (
// 		workspace.providerOptions?.openai == null ||
// 		workspace.providerOptions.openai.vectorStore.status !== "created"
// 	) {
// 		throw new Error("OpenAI not enabled");
// 	}
// 	const openaiVectorStoreId = workspace.providerOptions.openai.vectorStore.id;
// 	const node = workspace.nodes.find((node) => node.id === input.nodeId);
// 	if (node === undefined) {
// 		throw new Error("Node not found");
// 	}
// 	if (!isTextGenerationNode(node)) {
// 		throw new Error("Node is not a text generation node");
// 	}

// 	const tools: Array<AssistantTool> = [];
// 	const toolResources: AssistantCreateParams.ToolResources | null = {};
// 	const contexts = createContextMapFrom(
// 		node,
// 		new Map(workspace.nodes.map((node) => [node.id, node])),
// 	);
// 	const fileContexts: Array<FileNode> = [];

// 	for (const context of contexts.values()) {
// 		if (context.type === "variable" && context.content.type === "file") {
// 			fileContexts.push({ ...context, content: context.content });
// 		}
// 	}

// 	if (fileContexts.length > 0) {
// 		tools.push({ type: "file_search" });
// 		toolResources.file_search = {
// 			vector_store_ids: [openaiVectorStoreId],
// 		};
// 	}
// 	if (contexts.size > 0) {
// 		tools.push(openaiFunction(contexts));
// 	}

// 	const assistant = await openai.beta.assistants.create({
// 		model: "gpt-4o",
// 		tools,
// 		tool_resources: toolResources,
// 	});
// 	const thread = await openai.beta.threads.create();
// 	const threadMessage = await openai.beta.threads.messages.create(thread.id, {
// 		role: "user",
// 		content: input.message,
// 	});

// 	return AssistantResponse(
// 		{ threadId: thread.id, messageId: threadMessage.id },
// 		async ({ forwardStream }) => {
// 			// Run the assistant on the thread
// 			const runStream = openai.beta.threads.runs.stream(thread.id, {
// 				assistant_id: assistant.id,
// 			});

// 			// forward run status would stream message deltas
// 			let runResult = await forwardStream(runStream);

// 			while (
// 				isRun(runResult) &&
// 				runResult.status === "requires_action" &&
// 				runResult.required_action?.type === "submit_tool_outputs"
// 			) {
// 				const toolOutputs =
// 					runResult.required_action.submit_tool_outputs.tool_calls
// 						.map((toolCall: unknown) => {
// 							if (!isRequiredActionFunctionToolCall(toolCall)) {
// 								return null;
// 							}
// 							if (toolCall.function.name === openaiFunctionName._def.value) {
// 								const parameters = openaiFunctionParameters.parse(
// 									JSON.parse(toolCall.function.arguments),
// 								);
// 								for (const [contextNodeId, contextNode] of contexts) {
// 									if (contextNodeId !== parameters.contextNodeId) {
// 										continue;
// 									}
// 									switch (contextNode.content.type) {
// 										case "text":
// 											return {
// 												tool_call_id: toolCall.id,
// 												output: contextNode.content.text,
// 											};
// 										case "file": {
// 											const openAiFileIds = [];
// 											for (const file of contextNode.content.files) {
// 												if (file.status !== "uploaded") {
// 													continue;
// 												}
// 												openAiFileIds.push(file.openAi.fileId);
// 											}
// 											return {
// 												tool_call_id: toolCall.id,
// 												output: `check "${openAiFileIds.join(",")}" in vector store #${openaiVectorStoreId}`,
// 											};
// 										}
// 										case "textGeneration": {
// 											return {
// 												output: "hello",
// 												tool_call_id: toolCall.id,
// 											};
// 										}
// 										default: {
// 											const _exhaustiveCheck: never = contextNode.content;
// 											return _exhaustiveCheck;
// 										}
// 									}
// 								}
// 								return {
// 									tool_call_id: toolCall.id,
// 									output: "not found",
// 								};
// 							}
// 							return null;
// 						})
// 						.filter((toolCallOrNull) => toolCallOrNull !== null);
// 				runResult = await forwardStream(
// 					openai.beta.threads.runs.submitToolOutputsStream(runResult.id, {
// 						thread_id: thread.id,
// 						tool_outputs: toolOutputs,
// 					}),
// 				);
// 			}
// 			if (isRun(runResult)) {
// 				const messageList = await openai.beta.threads.messages.list(thread.id, {
// 					run_id: runResult.id,
// 				});
// 				const generatedTextParts: string[] = [];
// 				for (const message of messageList.data) {
// 					if (message.role !== "user") {
// 						continue;
// 					}
// 					for (const content of message.content) {
// 						if (content.type !== "text") {
// 							continue;
// 						}
// 						generatedTextParts.push(content.text.value);
// 					}
// 				}
// 			}
// 			await openai.beta.assistants.delete(assistant.id);
// 		},
// 	);
// }
