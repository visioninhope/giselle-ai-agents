import { z } from "zod/v4";
import { Capability, LanguageModelBase, Tier } from "./base";
import { BaseCostCalculator } from "./costs/calculator";
import { googleTokenPricing } from "./costs/model-prices";

const GoogleLanguageModelConfigurations = z.object({
	temperature: z.number(),
	topP: z.number(),
	searchGrounding: z.boolean(),
});
type GoogleLanguageModelConfigurations = z.infer<
	typeof GoogleLanguageModelConfigurations
>;

const defaultConfigurations: GoogleLanguageModelConfigurations = {
	temperature: 0.7,
	topP: 1.0,
	searchGrounding: false,
};

export const GoogleLanguageModelId = z
	.enum([
		"gemini-2.5-pro-preview-05-06",
		"gemini-2.5-flash-preview-05-20",
		"gemini-2.0-flash",
		"gemini-2.0-flash-lite",
	])
	.catch((ctx) => {
		if (typeof ctx.value !== "string") {
			return "gemini-2.0-flash";
		}
		if (ctx.value.startsWith("gemini-2.5-pro-preview-")) {
			return "gemini-2.5-pro-preview-05-06";
		}
		if (ctx.value.startsWith("gemini-2.5-flash-preview-")) {
			return "gemini-2.5-flash-preview-05-20";
		}
		return "gemini-2.0-flash";
	});

const GoogleLanguageModel = LanguageModelBase.extend({
	id: GoogleLanguageModelId,
	provider: z.literal("google"),
	configurations: GoogleLanguageModelConfigurations,
});
type GoogleLanguageModel = z.infer<typeof GoogleLanguageModel>;

const gemini25ProPreview: GoogleLanguageModel = {
	provider: "google",
	id: "gemini-2.5-pro-preview-05-06",
	capabilities:
		Capability.TextGeneration |
		Capability.GenericFileInput |
		Capability.OptionalSearchGrounding |
		Capability.Reasoning,
	tier: Tier.enum.pro,
	configurations: defaultConfigurations,
};

const gemini25FlashPreview: GoogleLanguageModel = {
	provider: "google",
	id: "gemini-2.5-flash-preview-05-20",
	capabilities:
		Capability.TextGeneration |
		Capability.GenericFileInput |
		Capability.OptionalSearchGrounding |
		Capability.Reasoning,
	tier: Tier.enum.pro,
	configurations: defaultConfigurations,
};

const gemini20Flash: GoogleLanguageModel = {
	provider: "google",
	id: "gemini-2.0-flash",
	capabilities:
		Capability.TextGeneration |
		Capability.OptionalSearchGrounding |
		Capability.GenericFileInput,
	tier: Tier.enum.free,
	configurations: defaultConfigurations,
};

const gemini20FlashLite: GoogleLanguageModel = {
	provider: "google",
	id: "gemini-2.0-flash-lite",
	capabilities:
		Capability.TextGeneration |
		Capability.OptionalSearchGrounding |
		Capability.GenericFileInput,
	tier: Tier.enum.free,
	configurations: defaultConfigurations,
};

export const models = [
	gemini25ProPreview,
	gemini25FlashPreview,
	gemini20Flash,
	gemini20FlashLite,
];

export const LanguageModel = GoogleLanguageModel;
export type LanguageModel = GoogleLanguageModel;

export class GoogleCostCalculator extends BaseCostCalculator {
	protected getPricingTable() {
		return googleTokenPricing;
	}
}
