import type { GiselleNodeId } from "../giselle-node/types";

type WebSearchId = `wbs_${string}`;

export const webSearchStatus = {
	pending: "pending",
	processing: "processing",
	completed: "completed",
} as const;

type WebSearchStatus = (typeof webSearchStatus)[keyof typeof webSearchStatus];

export interface WebSearch {
	id: WebSearchId;
	object: "webSearch";
	status: WebSearchStatus;
	name: string;
	items: WebSearchItemReference[];
	generatedNodeId: GiselleNodeId;
}

type WebSearchContentId = `wbs.cnt_${string}`;

export const webSearchItemStatus = {
	pending: "pending",
	processing: "processing",
	completed: "completed",
} as const;

type WebSearchItemStatus =
	(typeof webSearchItemStatus)[keyof typeof webSearchItemStatus];

interface WebSearchItem {
	id: WebSearchContentId;
	object: "webSearch.item";
	status: WebSearchItemStatus;
	title: string;
	content: string;
	url: string;
}
interface PendingWebSearchItemReference {
	id: WebSearchContentId;
	object: "webSearch.item.reference";
	status: Extract<WebSearchStatus, "pending">;
	title: string;
	url: string;
}
interface CompletedWebSearchItemReference {
	id: WebSearchContentId;
	object: "webSearch.item.reference";
	status: Extract<WebSearchStatus, "completed">;
	title: string;
	contentBlobUrl: string;
	url: string;
}
type WebSearchItemReference =
	| PendingWebSearchItemReference
	| CompletedWebSearchItemReference;
export interface GeneratedObject {
	plan: string;
	webSearch: WebSearch;
	description: string;
}

export type PartialGeneratedObject = Partial<GeneratedObject>;
