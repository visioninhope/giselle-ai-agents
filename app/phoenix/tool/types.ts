export const selectTool = {
	type: "select",
} as const;
type SelectTool = typeof selectTool;
export const handTool = {
	type: "hand",
} as const;
type HandTool = typeof handTool;
type AddTextGenerationNodeTool = {
	type: "add-text-generation-node";
};
type AddKnowledgeRetrievalNodeTool = {
	type: "add-knowledge-retrieval-node";
};
type AddWebScrapingNodeTool = {
	type: "add-web-scraping-node";
};
type AddTextNodeTool = {
	type: "add-text-node";
};
type AddAgentNodeTool = {
	type: "add-agent-node";
	agentId: string;
};

export type Tool =
	| SelectTool
	| HandTool
	| AddTextGenerationNodeTool
	| AddKnowledgeRetrievalNodeTool
	| AddWebScrapingNodeTool
	| AddTextNodeTool
	| AddAgentNodeTool;

export type ToolState = {
	currentTool: Tool;
};
