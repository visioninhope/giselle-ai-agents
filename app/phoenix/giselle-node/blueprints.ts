import { createGiselleNodeBlueprint } from "./factory";
import {
	createObjectParameterBlueprint,
	createStringParameterBlueprint,
} from "./parameter/factory";
import { giselleNodeCategories } from "./types";

export const textGeneratorBlueprint = createGiselleNodeBlueprint({
	archetype: "Text Generator",
	category: giselleNodeCategories.action,
	parameters: createObjectParameterBlueprint({
		type: "object",
		properties: {
			input: createStringParameterBlueprint({ type: "string", label: "Input" }),
			instruction: createStringParameterBlueprint({
				type: "string",
				label: "Instruction",
			}),
		},
		required: ["instruction"],
	}),
});

export const promptBlueprint = createGiselleNodeBlueprint({
	archetype: "Prompt",
	category: giselleNodeCategories.instruction,
});

export const archetypes = {
	textGenerator: textGeneratorBlueprint.archetype,
	prompt: promptBlueprint.archetype,
} as const;
