import { createGiselleNodeBlueprint } from "./factory";
import {
	createObjectParameterBlueprint,
	createStringParameterBlueprint,
} from "./parameter/factory";

export const textGeneratorBlueprint = createGiselleNodeBlueprint({
	archetype: "Text Generator",
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
});
