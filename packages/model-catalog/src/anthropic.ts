import { Capability, type Model, Tier } from "./types";

const claude37Sonnet: Model = {
	provider: "anthropic",
	modelId: "claude-3-7-sonnet-20250219",
	capabilities:
		Capability.TextGeneration |
		Capability.PdfFileInput |
		Capability.Reasoning |
		Capability.ImageFileInput,
	tier: Tier.Pro,
};
const claude35Sonnet: Model = {
	provider: "anthropic",
	modelId: "claude-3-5-sonnet-20241022",
	capabilities:
		Capability.TextGeneration |
		Capability.PdfFileInput |
		Capability.ImageFileInput,
	tier: Tier.Plus,
};

export { claude37Sonnet, claude35Sonnet };
