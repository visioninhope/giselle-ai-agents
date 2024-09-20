import { ToolActionTypes, type ToolActions } from "./actions";
import type { ToolState } from "./types"; // Adjust import paths accordingly

const initialState: ToolState = {
	currentTool: { type: "select" }, // Default to a select tool (adjust as necessary)
};

export const toolReducer = (
	state: ToolState,
	action: ToolActions,
): ToolState => {
	switch (action.type) {
		case ToolActionTypes.SetTool:
			return {
				...state,
				currentTool: action.payload,
			};
		default:
			return state;
	}
};
