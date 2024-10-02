import type {
	GiselleNodeArtifactElement,
	GiselleNodeId,
} from "../giselle-node/types";

type ArtifactElement = GiselleNodeArtifactElement | Artifact;
export type ArtifactId = `art_${string}`;
export type Artifact = {
	id: ArtifactId;
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
