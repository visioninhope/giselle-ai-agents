export type KnowledgeId = `knwl_${string}`;

export type KnowledgeContentId = `knwl.cnt_${string}`;
export type FileId = `fl_${string}`;

export type File = {
	id: FileId;
};

export const knowledgeContentType = {
	file: "file",
	text: "text",
} as const;

export type KnowledgeContentType =
	(typeof knowledgeContentType)[keyof typeof knowledgeContentType];

export const knowledgeContentStatus = {
	inProgress: "in_progress",
	completed: "completed",
	cancelled: "cancelled",
	failed: "failed",
} as const;
type KnowledgeContentStatus =
	(typeof knowledgeContentStatus)[keyof typeof knowledgeContentStatus];

export type KnowledgeContent = {
	id: KnowledgeContentId;
	name: string;
	status: KnowledgeContentStatus;
	file: File;
};

export type Knowledge = {
	id: KnowledgeId;
	name: string;
};

export type KnowledgeState = {
	knowledges: Knowledge[];
	isLoading: boolean;
};
