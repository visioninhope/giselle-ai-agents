import { type ReactNode, createContext, useContext, useState } from "react";
import type { Tool } from "../types";

interface ToolbarContext {
	open: boolean;
	setOpen: (open: boolean) => void;
	tool: Tool | undefined;
	setTool: (tool: Tool) => void;
}
const ToolbarContext = createContext<ToolbarContext | undefined>(undefined);

export function ToolbarContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [open, setOpen] = useState<boolean>(false);
	const [tool, setTool] = useState<Tool | undefined>(undefined);

	return (
		<ToolbarContext.Provider
			value={{
				open,
				setOpen,
				tool,
				setTool,
			}}
		>
			{children}
		</ToolbarContext.Provider>
	);
}

export function useToolbar() {
	const context = useContext(ToolbarContext);
	if (context === undefined) {
		throw new Error("useTool must be used within a ToolContextProvider");
	}
	return context;
}
