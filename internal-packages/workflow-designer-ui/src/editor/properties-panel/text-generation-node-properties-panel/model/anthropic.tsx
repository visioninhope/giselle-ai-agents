import { AnthropicLanguageModelData } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import {
	anthropicLanguageModels,
	Capability,
	hasCapability,
} from "@giselle-sdk/language-model";
import { useMemo } from "react";
import { Slider } from "../../../../ui/slider";
import { Switch } from "../../../../ui/switch";

export function AnthropicModelPanel({
	anthropicLanguageModel,
	onModelChange,
}: {
	anthropicLanguageModel: AnthropicLanguageModelData;
	onModelChange: (changedValue: AnthropicLanguageModelData) => void;
}) {
	const _limits = useUsageLimits();

	const hasReasoningCapability = useMemo(() => {
		const languageModel = anthropicLanguageModels.find(
			(lm) => lm.id === anthropicLanguageModel.id,
		);
		return languageModel && hasCapability(languageModel, Capability.Reasoning);
	}, [anthropicLanguageModel.id]);

	return (
		<div className="flex flex-col gap-[34px]">
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={anthropicLanguageModel.configurations.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										temperature: value,
									},
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={anthropicLanguageModel.configurations.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								AnthropicLanguageModelData.parse({
									...anthropicLanguageModel,
									configurations: {
										...anthropicLanguageModel.configurations,
										topP: value,
									},
								}),
							);
						}}
					/>

					{hasReasoningCapability ? (
						<Switch
							label="Reasoning"
							name="reasoning"
							checked={anthropicLanguageModel.configurations.reasoningText}
							onCheckedChange={(checked) => {
								onModelChange(
									AnthropicLanguageModelData.parse({
										...anthropicLanguageModel,
										configurations: {
											...anthropicLanguageModel.configurations,
											reasoningText: checked,
										},
									}),
								);
							}}
						/>
					) : (
						<>
							{/* Refactor this because it duplicates the Switch component */}
							<div className="flex flex-col">
								<div className="flex flex-row items-center justify-between">
									<p className="text-[14px]">Reasoning</p>
									<div className="flex-grow mx-[12px] h-[1px] bg-black-200/30" />
									<p className="text-[12px]">Unsuported</p>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
