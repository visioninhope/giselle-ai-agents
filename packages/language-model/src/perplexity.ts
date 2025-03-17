import { z } from "zod";
import { Capability, LanguageModelBase, Tier } from "./base";

const PerplexityLanguageModelConfigurations = z.object({
	temperature: z.number(),
	topP: z.number(),
});
type PerplexityLanguageModelConfigurations = z.infer<
	typeof PerplexityLanguageModelConfigurations
>;

const defaultConfigurations: PerplexityLanguageModelConfigurations = {
	temperature: 0.7,
	topP: 1.0,
};

const PerplexityLanguageModel = LanguageModelBase.extend({
	provider: z.literal("perplexity"),
	configurations: PerplexityLanguageModelConfigurations,
});
type PerplexityLanguageModel = z.infer<typeof PerplexityLanguageModel>;

const sonar: PerplexityLanguageModel = {
	provider: "perplexity",
	id: "sonar",
	capabilities: Capability.TextGeneration && Capability.SearchGrounding,
	tier: Tier.enum.free,
	configurations: defaultConfigurations,
};

const sonarPro: PerplexityLanguageModel = {
	provider: "perplexity",
	id: "sonar-pro",
	capabilities: Capability.TextGeneration && Capability.SearchGrounding,
	tier: Tier.enum.pro,
	configurations: defaultConfigurations,
};

export const models = [sonar, sonarPro];

export const LanguageModel = PerplexityLanguageModel;
export type LanguageModel = PerplexityLanguageModel;
