import { PerplexityLanguageModelData } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import {
	FrequencyPenaltySlider,
	PresencePenaltySlider,
	TemperatureSlider,
	TopPSlider,
} from "./shared-model-controls";
import { SimpleDomainFilter } from "./simple-domain-filter";

export function PerplexityModelPanel({
	perplexityLanguageModel,
	onModelChange,
}: {
	perplexityLanguageModel: PerplexityLanguageModelData;
	onModelChange: (changedValue: PerplexityLanguageModelData) => void;
}) {
	useUsageLimits();

	const handleSearchDomainFilterChange = (newFilter: string[]) => {
		onModelChange(
			PerplexityLanguageModelData.parse({
				...perplexityLanguageModel,
				configurations: {
					...perplexityLanguageModel.configurations,
					searchDomainFilter: newFilter,
				},
			}),
		);
	};

	return (
		<div className="flex flex-col gap-[34px]">
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<TemperatureSlider
						onModelChange={onModelChange}
						modelData={perplexityLanguageModel}
						parseModelData={PerplexityLanguageModelData.parse}
					/>
					<TopPSlider
						onModelChange={onModelChange}
						modelData={perplexityLanguageModel}
						parseModelData={PerplexityLanguageModelData.parse}
					/>
					<FrequencyPenaltySlider
						onModelChange={onModelChange}
						modelData={perplexityLanguageModel}
						parseModelData={PerplexityLanguageModelData.parse}
					/>
					<PresencePenaltySlider
						onModelChange={onModelChange}
						modelData={perplexityLanguageModel}
						parseModelData={PerplexityLanguageModelData.parse}
						min={-2.0}
					/>
				</div>
			</div>
			<SimpleDomainFilter
				searchDomainFilter={
					perplexityLanguageModel.configurations.searchDomainFilter || []
				}
				onSearchDomainFilterChange={handleSearchDomainFilterChange}
			/>
		</div>
	);
}
