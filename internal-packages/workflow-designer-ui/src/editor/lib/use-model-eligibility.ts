import { useUsageLimits } from "@giselle-sdk/giselle/react";
import { hasTierAccess, type LanguageModel } from "@giselle-sdk/language-model";
import { useCallback } from "react";

export function useModelEligibility() {
	const usageLimits = useUsageLimits();
	const checkEligibility = useCallback(
		(languageModel: LanguageModel) => {
			if (!usageLimits) {
				return true;
			}
			return hasTierAccess(languageModel, usageLimits.featureTier);
		},
		[usageLimits],
	);

	return checkEligibility;
}
