import { type LanguageModel, hasTierAccess } from "@giselle-sdk/language-model";
import type { Subscription } from "@giselle-sdk/subscription";

export function languageModelAvailable(
	languageModel: LanguageModel,
	subscription?: Subscription,
) {
	if (!subscription) {
		return true;
	}
	return hasTierAccess(languageModel, subscription.languageModelTier);
}
