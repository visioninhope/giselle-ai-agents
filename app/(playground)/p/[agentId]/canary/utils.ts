import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createId } from "@paralleldrive/cuid2";
import type { LanguageModelV1 } from "ai";
import type {
	ArtifactId,
	ConnectionId,
	File,
	GraphId,
	Node,
	NodeHandleId,
	Text,
	TextGenerateActionContent,
	TextGeneration,
} from "./types";

export function createArtifactId(): ArtifactId {
	return `artf_${createId()}`;
}

export function createGraphId(): GraphId {
	return `grph_${createId()}`;
}

export function createNodeHandleId(): NodeHandleId {
	return `ndh_${createId()}`;
}

export function createConnectionId(): ConnectionId {
	return `cnnc_${createId()}`;
}

export function resolveLanguageModel(
	llm: TextGenerateActionContent["llm"],
): LanguageModelV1 {
	const [provider, model] = llm.split(":");
	if (provider === "openai") {
		return openai(model);
	}
	if (provider === "anthropic") {
		return anthropic(model);
	}
	throw new Error("Unsupported model provider");
}

export function isTextGeneration(node: Node): node is TextGeneration {
	return node.content.type === "textGeneration";
}

export function isText(node: Node): node is Text {
	return node.content.type === "text";
}

export function isFile(node: Node): node is File {
	return node.content.type === "file";
}
