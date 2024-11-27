import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createId } from "@paralleldrive/cuid2";
import type { LanguageModelV1 } from "ai";
import type {
	ArtifactId,
	GraphId,
	Node,
	TextGenerateActionContent,
	TextGeneration,
} from "./types";

export function createArtifactId(): ArtifactId {
	return `artf_${createId()}`;
}

export function createGraphId(): GraphId {
	return `grph_${createId()}`;
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
