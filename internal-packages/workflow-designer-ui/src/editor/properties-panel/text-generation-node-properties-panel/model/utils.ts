import type { UsageLimits } from "@giselle-sdk/giselle";
import { hasTierAccess, type LanguageModel } from "@giselle-sdk/language-model";

export function languageModelAvailable(
	languageModel: LanguageModel,
	limits?: UsageLimits,
) {
	if (!limits) {
		return true;
	}
	return hasTierAccess(languageModel, limits.featureTier);
}
