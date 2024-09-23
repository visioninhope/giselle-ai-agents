import { type FC, type PropsWithChildren, useReducer } from "react";
import { ToolContext } from "./context";
import { toolReducer } from "./reducer";
import { selectTool } from "./types";

export const ToolProvider: FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(toolReducer, {
		currentTool: selectTool,
	});

	return (
		<ToolContext.Provider value={{ state, dispatch }}>
			{children}
		</ToolContext.Provider>
	);
};
