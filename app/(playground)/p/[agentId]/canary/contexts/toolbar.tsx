import { type ReactNode, createContext, useContext, useState } from "react";
import type { Tool } from "../types";

type ToolbarSection = "main" | "star";
type ToolbarVisibility = Record<ToolbarSection, boolean>;

interface ToolbarContext {
	selectedTool: Tool | undefined;
	selectTool: (tool: Tool["action"] | undefined) => void;
	clearToolAndSections: () => void;
}

const ToolbarContext = createContext<ToolbarContext | undefined>(undefined);

export function ToolbarContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	// Initially all sections are closed
	const [activeToolbarSection, setActiveToolbarSection] =
		useState<ToolbarVisibility>({
			main: false,
			star: false,
		});

	const [selectedTool, setSelectedTool] = useState<Tool | undefined>(undefined);

	// Function to toggle section visibility
	const setToolbarSection = (section: ToolbarSection) => {
		setActiveToolbarSection((prev) => ({
			...prev,
			// Close other sections and toggle the selected section
			main: section === "main" ? !prev.main : false,
			star: section === "star" ? !prev.star : false,
		}));
	};

	// Handle tool selection
	const selectTool = (tool: Tool["action"] | undefined) => {
		switch (tool) {
			case "addTextNode":
				return setSelectedTool({
					action: "addTextNode",
					category: "edit",
				});
			case "addFileNode":
				return setSelectedTool({
					action: "addFileNode",
					category: "edit",
				});
			case "addTextGenerationNode":
				return setSelectedTool({
					action: "addTextGenerationNode",
					category: "edit",
				});
			case "move":
				return setSelectedTool({
					action: "move",
					category: "move",
				});
			default:
				return setSelectedTool(undefined);
		}
	};

	// Clear tool selection and close all sections
	const clearToolAndSections = () => {
		setSelectedTool(undefined);
		setActiveToolbarSection({
			main: false,
			star: false,
		});
	};

	return (
		<ToolbarContext.Provider
			value={{
				selectedTool,
				selectTool,
				clearToolAndSections,
			}}
		>
			{children}
		</ToolbarContext.Provider>
	);
}

export function useToolbar() {
	const context = useContext(ToolbarContext);
	if (context === undefined) {
		throw new Error("useToolbar must be used within a ToolbarContextProvider");
	}
	return context;
}
