import { Select } from "@giselle-internal/ui/select";
import { FalLanguageModelData } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import { imageGenerationSizes } from "@giselle-sdk/language-model";
import { Slider } from "../../../../ui/slider";

export function FalModelPanel({
	languageModel,
	onModelChange,
}: {
	languageModel: FalLanguageModelData;
	onModelChange: (changedValue: FalLanguageModelData) => void;
}) {
	const _limits = useUsageLimits();

	return (
		<div className="grid grid-cols-2 gap-[16px]">
			<fieldset className="flex flex-col">
				<label htmlFor="size" className="text-text text-[13px] mb-[2px]">
					Size
				</label>
				<Select
					id="size"
					placeholder="Select a Size"
					value={languageModel.configurations.size}
					onValueChange={(value) => {
						onModelChange(
							FalLanguageModelData.parse({
								...languageModel,
								configurations: {
									...languageModel.configurations,
									size: value,
								},
							}),
						);
					}}
					options={imageGenerationSizes.options.map((imageGenerationSize) => ({
						value: imageGenerationSize,
						label: imageGenerationSize,
					}))}
				/>
			</fieldset>
			<div>
				<Slider
					label="Number of Images"
					value={languageModel.configurations.n}
					max={4.0}
					min={1.0}
					step={1.0}
					onChange={(value) => {
						onModelChange(
							FalLanguageModelData.parse({
								...languageModel,
								configurations: {
									...languageModel.configurations,
									n: value,
								},
							}),
						);
					}}
				/>
			</div>
		</div>
	);
}
