import { GoogleLanguageModelData } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import { Slider } from "../../../../ui/slider";
import { Switch } from "../../../../ui/switch";

export function GoogleModelPanel({
	googleLanguageModel,
	onModelChange,
	onSearchGroundingConfigurationChange,
}: {
	googleLanguageModel: GoogleLanguageModelData;
	onModelChange: (changedValue: GoogleLanguageModelData) => void;
	onSearchGroundingConfigurationChange: (enabled: boolean) => void;
}) {
	const _limits = useUsageLimits();

	return (
		<div className="flex flex-col gap-[34px]">
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={googleLanguageModel.configurations.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								GoogleLanguageModelData.parse({
									...googleLanguageModel,
									configurations: {
										...googleLanguageModel.configurations,
										temperature: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={googleLanguageModel.configurations.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								GoogleLanguageModelData.parse({
									...googleLanguageModel,
									configurations: {
										...googleLanguageModel.configurations,
										topP: value,
									},
								}),
							);
						}}
					/>
					<Switch
						label="Search Grounding"
						name="searchGrounding"
						checked={googleLanguageModel.configurations.searchGrounding}
						onCheckedChange={(checked) => {
							onSearchGroundingConfigurationChange(checked);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
