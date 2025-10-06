import { GoogleLanguageModelData } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import { Switch } from "../../../../ui/switch";
import { TemperatureSlider, TopPSlider } from "./shared-model-controls";

export function GoogleModelPanel({
	googleLanguageModel,
	onModelChange,
	onSearchGroundingConfigurationChange,
	onUrlContextConfigurationChange,
}: {
	googleLanguageModel: GoogleLanguageModelData;
	onModelChange: (changedValue: GoogleLanguageModelData) => void;
	onSearchGroundingConfigurationChange: (enabled: boolean) => void;
	onUrlContextConfigurationChange: (enabled: boolean) => void;
}) {
	useUsageLimits();

	return (
		<div className="flex flex-col gap-[34px]">
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<TemperatureSlider
						onModelChange={onModelChange}
						modelData={googleLanguageModel}
						parseModelData={GoogleLanguageModelData.parse}
					/>
					<TopPSlider
						onModelChange={onModelChange}
						modelData={googleLanguageModel}
						parseModelData={GoogleLanguageModelData.parse}
					/>
				</div>
				<div className="mt-[24px] flex flex-col gap-[16px]">
					<Switch
						label="Search Grounding"
						name="searchGrounding"
						checked={googleLanguageModel.configurations.searchGrounding}
						onCheckedChange={(checked) => {
							onSearchGroundingConfigurationChange(checked);
						}}
					/>
					<Switch
						label="URL Context"
						name="urlContext"
						checked={googleLanguageModel.configurations.urlContext ?? false}
						onCheckedChange={(checked) => {
							onUrlContextConfigurationChange(checked);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
