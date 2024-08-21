import type { KnowledgeContentType } from "@/drizzle/schema";
import type { VectorStoreFile } from "openai/resources/beta/vector-stores/files";

export type KnowledgeContent = {
	isCreating?: boolean;
	id: number;
	name: string;
	type: KnowledgeContentType;
	status: VectorStoreFile["status"];
	openaiVectorStoreFileId: string;
	file: {
		id: number;
		openaiFileId: string;
	};
};

export type Knowledge = {
	isCreating?: boolean;
	id: number;
	name: string;
	openaiVectorStoreId: string;
	contents: KnowledgeContent[];
};
