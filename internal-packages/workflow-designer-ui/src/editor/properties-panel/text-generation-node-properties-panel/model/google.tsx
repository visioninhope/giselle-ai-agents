import { Google, GoogleGenerativeAIModelId } from "@giselle-sdk/data-type";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { Slider } from "../../../../ui/slider";
import { Switch } from "../../../../ui/switch";

export function GoogleModelPanel({
	google,
	onModelChange,
}: {
	google: Google;
	onModelChange: (changedValue: Google) => void;
}) {
	return (
		<div className="flex flex-col gap-[34px]">
			<Select
				value={google.model}
				onValueChange={(value) => {
					onModelChange(
						Google.parse({
							...google,
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
							value={GoogleGenerativeAIModelId.Enum["gemini-2.0-pro-exp-02-05"]}
						>
							gemini-2.0-pro-exp-02-05
						</SelectItem>
						<SelectItem
							value={
								GoogleGenerativeAIModelId.Enum[
									"gemini-2.0-flash-thinking-exp-01-21"
								]
							}
						>
							gemini-2.0-flash-thinking-exp-01-21
						</SelectItem>
						<SelectItem
							value={GoogleGenerativeAIModelId.Enum["gemini-2.0-flash-exp"]}
						>
							gemini-2.0-flash-exp
						</SelectItem>
						<SelectItem
							value={GoogleGenerativeAIModelId.Enum["gemini-1.5-pro-latest"]}
						>
							gemini-1.5-pro-latest
						</SelectItem>
						<SelectItem
							value={GoogleGenerativeAIModelId.Enum["gemini-1.5-flash-latest"]}
						>
							gemini-1.5-flash-latest
						</SelectItem>
						<SelectItem
							value={
								GoogleGenerativeAIModelId.Enum["gemini-1.5-flash-8b-latest"]
							}
						>
							gemini-1.5-flash-8b-latest
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<div>
				<div className="grid grid-cols-2 gap-[24px]">
					<Slider
						label="Temperature"
						value={google.temperature}
						max={2.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								Google.parse({
									...google,
									temperature: value,
								}),
							);
						}}
					/>
					<Slider
						label="Top P"
						value={google.topP}
						max={1.0}
						min={0.0}
						step={0.01}
						onChange={(value) => {
							onModelChange(
								Google.parse({
									...google,
									topP: value,
								}),
							);
						}}
					/>
					<Switch
						label="Search Grounding"
						name="searchGrounding"
						checked={google.searchGrounding}
						onCheckedChange={(checked) => {
							onModelChange(
								Google.parse({
									...google,
									searchGrounding: checked,
								}),
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
