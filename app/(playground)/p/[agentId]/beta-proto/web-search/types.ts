type WebSearchId = `wbs_${string}`;

const webSearchStatus = {
	pending: "pending",
	processing: "processing",
	completed: "completed",
} as const;

type WebSearchStatus = (typeof webSearchStatus)[keyof typeof webSearchStatus];

interface WebSearch {
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
	stauts: WebSearchItemStatus;
	title: string;
	content: string;
	url: string;
}

interface GeneratedObject {
	thinking: string;
	webSearch: WebSearch;
	description: string;
}
