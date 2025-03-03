import { Capability, type Model, Tier } from "./types";

const gpt4o: Model = {
	provider: "openai",
	modelId: "gpt-4o",
	capabilities: Capability.ImageFileInput | Capability.TextGeneration,
	tier: Tier.Plus,
};

const gpt4oMini: Model = {
	provider: "openai",
	modelId: "gpt-4o-mini",
	capabilities: Capability.ImageFileInput | Capability.TextGeneration,
	tier: Tier.Free,
};

const o3Mini: Model = {
	provider: "openai",
	modelId: "o3mini",
	capabilities: Capability.TextGeneration,
	tier: Tier.Pro,
};

export { gpt4o, gpt4oMini, o3Mini };
