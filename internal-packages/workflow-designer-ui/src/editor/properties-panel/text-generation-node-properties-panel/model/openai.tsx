import { OpenAI } from "@giselle-sdk/data-type";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { Slider } from "../../../../ui/slider";

export function OpenAIModelPanel({
	openai,
	onModelChange,
}: {
	openai: OpenAI;
	onModelChange: (changedValue: OpenAI) => void;
}) {
	return (
		<div className="flex flex-col gap-[34px]">
			<Select
				value={openai.model}
				onValueChange={(value) => {
					onModelChange(
						OpenAI.parse({
							...openai,
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
						<SelectItem value="gpt-4o">gpt-4o</SelectItem>
						<SelectItem value="o1-mini">o1-mini</SelectItem>
						<SelectItem value="o1-preview">o1-preview</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={openai.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								OpenAI.parse({
									...openai,
									temperature: value,
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={openai.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								OpenAI.parse({
									...openai,
									topP: value,
								}),
							);
						}}
					/>
					<Slider
						label="Frequency Panalty"
						value={openai.frequencyPenalty}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								OpenAI.parse({
									...openai,
									frequencyPenalty: value,
								}),
							);
						}}
					/>
					<Slider
						label="Presence Penalty"
						value={openai.presencePenalty}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								OpenAI.parse({
									...openai,
									presencePenalty: value,
								}),
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
