import type { GiselleNodeId } from "../../giselle-node/types";

interface BaseStepNode {
	id: GiselleNodeId;
	object: "node";
	name: string;
	archetype: string;
}

type ModelProvider = "openai";
interface TextGeneratorProperty {
	model: {
		provider: ModelProvider;
		modelId: string;
		configurations: {
			temperature: number;
			topP: number;
		};
	};
}
export interface TextGeneratorStepNode extends BaseStepNode {
	property: TextGeneratorProperty;
}
export interface WebSearchStepNode extends BaseStepNode {}

export type StepNode = TextGeneratorStepNode | WebSearchStepNode;
