import type { FileCategory, LLMProvider } from "@giselle-sdk/data-type";

interface ToolBase {
	category: string;
	action: string;
}

export interface AddTextNodeTool extends ToolBase {
	category: "edit";
	action: "addTextNode";
}
export interface AddFileNodeTool extends ToolBase {
	category: "edit";
	action: "addFileNode";
	fileCategory?: FileCategory;
}
export interface AddTextGenerationNodeTool extends ToolBase {
	category: "edit";
	action: "addTextGenerationNode";
	provider?: LLMProvider;
}
export interface MoveTool extends ToolBase {
	category: "move";
	action: "move";
}
export type Tool =
	| AddTextNodeTool
	| AddFileNodeTool
	| AddTextGenerationNodeTool
	| MoveTool;

type ToolAction =
	| AddTextNodeTool["action"]
	| AddFileNodeTool["action"]
	| AddTextGenerationNodeTool["action"]
	| MoveTool["action"];

export function isToolAction(args: unknown): args is ToolAction {
	if (typeof args === "string") {
		return (
			args === "addTextNode" ||
			args === "addFileNode" ||
			args === "addTextGenerationNode" ||
			args === "move"
		);
	}
	return false;
}
