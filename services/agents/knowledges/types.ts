export type KnowledgeId = `knwl_${string}`;

export type FileId = `fl_${string}`;

export const knowledgeContentType = {
	file: "file",
	text: "text",
} as const;

export type KnowledgeContentType =
	(typeof knowledgeContentType)[keyof typeof knowledgeContentType];
