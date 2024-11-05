import { giselleNodeArchetypes } from "../../giselle-node/blueprints";
import type { GiselleNode } from "../../giselle-node/types";
import type {
	StepNode,
	TextGeneratorStepNode,
	WebSearchStepNode,
} from "./types";

export function buildStepNode(node: GiselleNode): StepNode {
	if (node.archetype === giselleNodeArchetypes.textGenerator) {
		return {
			id: node.id,
			object: "node",
			name: node.name,
			archetype: node.archetype,
			property: {
				model: {
					provider: "openai",
					modelId: "gpt-3.5-turbo",
					configurations: {
						temperature: 0.5,
						topP: 0.9,
					},
				},
			},
		} satisfies TextGeneratorStepNode;
	}
	if (node.archetype === giselleNodeArchetypes.webSearch) {
		return {
			id: node.id,
			object: "node",
			name: node.name,
			archetype: node.archetype,
		} satisfies WebSearchStepNode;
	}
	throw new Error("Unexpected error");
}
