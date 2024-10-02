import type {
	GiselleNodeArtifactElement,
	GiselleNodeId,
} from "../giselle-node/types";

type ArtifactElement = GiselleNodeArtifactElement | Artifact;
export type Artifact = {
	type: "artifact";
	title: string;
	content: string;
	generatedNodeId: GiselleNodeId;
	elements: ArtifactElement[];
};

export type GeneratedObject = {
	thinking: string;
	artifact: { title: string; content: string; completed: boolean };
	description: string;
};
export type PartialGeneratedObject = Partial<GeneratedObject>;
