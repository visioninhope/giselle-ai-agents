import type { KnowledgeContentType } from "@/drizzle/schema";
import type { VectorStoreFile } from "openai/resources/beta/vector-stores/files";

export type KnowledgeContent = {
	isCreating?: boolean;
	id: number;
	name: string;
	type: KnowledgeContentType;
	status: VectorStoreFile["status"];
	file: {
		id: number;
	};
};

export type Knowledge = {
	isCreating?: boolean;
	id: number;
	name: string;
	contents: KnowledgeContent[];
};
