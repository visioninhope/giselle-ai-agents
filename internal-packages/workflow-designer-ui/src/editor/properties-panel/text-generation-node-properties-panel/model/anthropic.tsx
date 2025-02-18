import { Anthropic, AnthropicModelId } from "@giselle-sdk/data-type";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { Slider } from "../../../../ui/slider";

export function AnthropicModelPanel({
	anthropic,
	onModelChange,
}: {
	anthropic: Anthropic;
	onModelChange: (changedValue: Anthropic) => void;
}) {
	return (
		<div className="flex flex-col gap-[34px]">
			<Select
				value={anthropic.model}
				onValueChange={(value) => {
					onModelChange(
						Anthropic.parse({
							...anthropic,
							model: value,
						}),
					);
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a LLM" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem
							value={AnthropicModelId.Enum["claude-3-5-sonnet-latest"]}
						>
							claude-3-5-sonnet-latest
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={anthropic.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								Anthropic.parse({
									...anthropic,
									temperature: value,
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={anthropic.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								Anthropic.parse({
									...anthropic,
									topP: value,
								}),
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
