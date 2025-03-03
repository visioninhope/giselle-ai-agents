import { Capability, type Model, Tier } from "./types";

const gemini20Flash: Model = {
	provider: "google",
	modelId: "gemini-2.0-flash-001",
	capabilities:
		Capability.TextGeneration |
		Capability.SearchGrounding |
		Capability.GenericFileInput,
	tier: Tier.Free,
};

const gemini20FlashLitePreview: Model = {
	provider: "google",
	modelId: "gemini-2.0-flash-lite-preview-02-05",
	capabilities: Capability.TextGeneration | Capability.GenericFileInput,
	tier: Tier.Plus,
};
const gemini20FlashThinkingExp: Model = {
	provider: "google",
	modelId: "gemini-2.0-flash-thinking-exp-01-21",
	capabilities:
		Capability.TextGeneration |
		Capability.GenericFileInput |
		Capability.Reasoning,
	tier: Tier.Plus,
};
const gemini20ProExp: Model = {
	provider: "google",
	modelId: "gemini-2.0-pro-exp-02-05",
	capabilities:
		Capability.TextGeneration |
		Capability.GenericFileInput |
		Capability.SearchGrounding,
	tier: Tier.Plus,
};

export {
	gemini20Flash,
	gemini20FlashLitePreview,
	gemini20FlashThinkingExp,
	gemini20ProExp,
};
