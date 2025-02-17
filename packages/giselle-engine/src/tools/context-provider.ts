import { type LLMProvider, type Node, NodeId } from "@giselle-sdk/data-type";
import { tool } from "ai";
import { zodFunction } from "openai/helpers/zod";
import { z } from "zod";
import type { FileIndex } from "../core/helpers";

function getOrdinal(n: number): string {
	const rules = new Intl.PluralRules("en", { type: "ordinal" });
	const suffixes: { [key: string]: string } = {
		one: "st",
		two: "nd",
		few: "rd",
		other: "th",
	};
	const suffix = suffixes[rules.select(n)];
	return `${n}${suffix}`;
}

export function createContextProviderTool({
	contextNodes,
	llmProvider,
	textGenerationNodeResolver,
	fileIndices,
}: {
	contextNodes: Node[];
	llmProvider: LLMProvider;
	textGenerationNodeResolver: (nodeId: NodeId) => Promise<string | undefined>;
	fileIndices: FileIndex[];
}) {
	if (contextNodes.length === 0) {
		return null;
	}
	return {
		contextProvider: tool({
			description: `Provide context that need to archieve user request. You can get following contextNodeIds: ${contextNodes.map((n) => n.id).join(",")}`,
			parameters: z.object({
				contextNodeId: NodeId.schema,
			}),
			execute: async ({ contextNodeId }) => {
				console.log(`contextNodeId: ${contextNodeId}`);
				const contextNode = contextNodes.find(
					(node) => node.id === contextNodeId,
				);
				if (contextNode === undefined) {
					console.warn(`ContextNode: ${contextNodeId} not found`);
					return "";
				}
				if (
					contextNode.type === "action" &&
					contextNode.content.type === "textGeneration"
				) {
					return await textGenerationNodeResolver(contextNode.id);
				}
				if (contextNode.content.type === "text") {
					return contextNode.content.text;
				}
				if (contextNode.content.type === "file") {
					switch (llmProvider) {
						case "anthropic":
						case "google": {
							const fileIndex = fileIndices.find(
								(fileIndex) => fileIndex.nodeId === contextNode.id,
							);
							if (fileIndex === undefined) {
								return "Context not found";
							}
							if (fileIndex.start === fileIndex.end) {
								console.log(
									`check ${getOrdinal(fileIndex.start)} file in attached files`,
								);
								return `check ${getOrdinal(fileIndex.start)} attached file`;
							}
							console.log(
								`check ${getOrdinal(fileIndex.start)} to ${getOrdinal(fileIndex.end)} files in attached files`,
							);
							return `check ${getOrdinal(fileIndex.start)} to ${getOrdinal(fileIndex.end)} files in attached files`;
						}
						case "openai": {
							throw new Error(
								"This tool does not support OpenAI. Please use openaiFunction",
							);
						}
						default: {
							const _exhaustiveCheck: never = llmProvider;
							return _exhaustiveCheck;
						}
					}
				}
				console.warn(`ContextNode: ${contextNodeId} is not supported`);
				return contextNode;
			},
		}),
	};
}

export const openaiFunctionParameters = z.object({
	contextNodeId: z.string(),
});
export const openaiFunctionName = z.literal("getContext");
export function openaiFunction(contextNodes: Node[]) {
	return zodFunction({
		name: openaiFunctionName._def.value,
		description: `Provide context that need to archieve user request. You can get following contextNodeIds: ${contextNodes.join(",")}`,
		parameters: openaiFunctionParameters,
	});
}
