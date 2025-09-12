import { GoogleImageLanguageModelData } from "@giselle-sdk/data-type";
import { useUsageLimits } from "@giselle-sdk/giselle/react";
import { googleImageLanguageModels } from "@giselle-sdk/language-model";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { languageModelAvailable } from "../utils";

export function GoogleImageModelPanel({
	languageModel,
	onModelChange,
}: {
	languageModel: GoogleImageLanguageModelData;
	onModelChange: (changedValue: GoogleImageLanguageModelData) => void;
}) {
	const limits = useUsageLimits();

	return (
		<div className="flex flex-col gap-[34px]">
			<Select
				value={languageModel.id}
				onValueChange={(value) => {
					onModelChange(
						GoogleImageLanguageModelData.parse({
							...languageModel,
							id: value,
						}),
					);
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select a LLM" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{googleImageLanguageModels.map((googleImageModel) => (
							<SelectItem
								key={googleImageModel.id}
								value={googleImageModel.id}
								disabled={!languageModelAvailable(googleImageModel, limits)}
							>
								{googleImageModel.id}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>

			{/* Google Image models currently don't have additional configuration options */}
		</div>
	);
}
