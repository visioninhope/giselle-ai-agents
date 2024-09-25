import { createGiselleNodeBlueprint } from "./factory";
import {
	createObjectParameterBlueprint,
	createStringParameterBlueprint,
} from "./parameter/factory";
import { giselleNodeCategories } from "./types";

export const textGeneratorParameterNames = {
	input: "input",
	instruction: "instruction",
};
export const textGeneratorBlueprint = createGiselleNodeBlueprint({
	archetype: "Text Generator",
	category: giselleNodeCategories.action,
	resultPortLabel: "Result",
	parameters: createObjectParameterBlueprint({
		type: "object",
		properties: {
			[textGeneratorParameterNames.input]: createStringParameterBlueprint({
				type: "string",
				label: "Input",
			}),
			[textGeneratorParameterNames.instruction]: createStringParameterBlueprint(
				{
					type: "string",
					label: "Instruction",
				},
			),
		},
		required: ["instruction"],
	}),
});

export const promptBlueprint = createGiselleNodeBlueprint({
	archetype: "Prompt",
	category: giselleNodeCategories.instruction,
	resultPortLabel: "Text",
});

export const giselleNodeArchetypes = {
	textGenerator: textGeneratorBlueprint.archetype,
	prompt: promptBlueprint.archetype,
} as const;
