type WebSearchId = `wbs_${string}`;

export const webSearchStatus = {
	pending: "pending",
	processing: "processing",
	completed: "completed",
} as const;

type WebSearchStatus = (typeof webSearchStatus)[keyof typeof webSearchStatus];

export interface WebSearch {
	id: WebSearchId;
	status: WebSearchStatus;
	name: string;
	items: WebSearchItem[];
}

type WebSearchContentId = `wbs.cnt_${string}`;

const webSearchItemStatus = {
	pending: "pending",
	processing: "processing",
	completed: "completed",
} as const;

type WebSearchItemStatus =
	(typeof webSearchItemStatus)[keyof typeof webSearchItemStatus];

interface WebSearchItem {
	id: WebSearchContentId;
	status: WebSearchItemStatus;
	title: string;
	content: string;
	url: string;
}

export interface GeneratedObject {
	thinking: string;
	webSearch: WebSearch;
	description: string;
}

export type PartialGeneratedObject = Partial<GeneratedObject>;
