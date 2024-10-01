import type { GiselleNode, GiselleNodeArtifactElement } from "./types";

export function giselleNodeToGiselleNodeArtifactElement(
	node: GiselleNode,
): GiselleNodeArtifactElement {
	return {
		id: node.id,
		object: "node.artifactElement",
		name: node.name,
		category: node.category,
		archetype: node.archetype,
		properties: node.properties,
	};
}
