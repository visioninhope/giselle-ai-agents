import { jsonSchema } from "ai";

export type Artifact = {
	title: string;
	content: string;
	completed: boolean;
};

export type GeneratedObject = {
	thinking: string;
	artifact: Artifact;
	description: string;
};
export type PartialGeneratedObject = Partial<GeneratedObject>;
