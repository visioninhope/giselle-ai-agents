import type { Tool } from "./types";

export const ToolActionTypes = {
	SetTool: "SetTool",
};

export type SetToolAction = {
	type: typeof ToolActionTypes.SetTool;
	payload: Tool;
};
export const setTool = (tool: Tool): SetToolAction => ({
	type: ToolActionTypes.SetTool,
	payload: tool,
});

export type ToolActions = SetToolAction;
