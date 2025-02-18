import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LLM } from "@giselle-sdk/data-type";
import type { LanguageModelV1 } from "ai";

export function llmToAiSdkLanguageModel(llm: LLM): LanguageModelV1 {
	switch (llm.provider) {
		case "openai":
			return openai(llm.model);
		case "anthropic":
			return anthropic(llm.model);
		case "google":
			return google(llm.model);
		default: {
			const _exhaustiveCheck: never = llm;
			return _exhaustiveCheck;
		}
	}
}
