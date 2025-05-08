import type { LanguageModel } from "@giselle-sdk/language-model";
import type { ToolSet } from "ai";

type TelemetryTag =
	| "web-search"
	| "search-grounding"
	| "reasoning"
	| "thinking";

export function generateTelemetryTags(args: {
	provider: string;
	languageModel: LanguageModel;
	toolSet: ToolSet;
	configurations: Record<string, unknown>;
}): TelemetryTag[] {
	const tags: TelemetryTag[] = [];

	// OpenAI Web Search
	if (args.provider === "openai" && args.toolSet.openaiWebSearch) {
		tags.push("web-search");
	}

	// Google Search Grounding
	if (args.provider === "google" && args.configurations.searchGrounding) {
		tags.push("search-grounding");
	}

	// Anthropic Reasoning/Thinking
	if (args.provider === "anthropic") {
		if (args.configurations.reasoning) {
			tags.push("reasoning");
		}
		if (args.configurations.thinking) {
			tags.push("thinking");
		}
	}

	return tags;
}
