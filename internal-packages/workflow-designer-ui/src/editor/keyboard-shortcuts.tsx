import { useEffect } from "react";
import {
	addFileNodeTool,
	addTextGenerationNodeTool,
	addTextNodeTool,
	moveTool,
	useToolbar,
} from "./tool/toolbar";

const ignoredTags = ["INPUT", "TEXTAREA", "SELECT"];

export function KeyboardShortcuts() {
	const { setSelectedTool } = useToolbar();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const activeElement = document.activeElement;

			if (
				ignoredTags.includes(activeElement?.tagName ?? "") ||
				activeElement?.getAttribute("contenteditable") === "true"
			) {
				return;
			}
			switch (event.key) {
				case "v":
					setSelectedTool(moveTool());
					break;
				case "t":
					setSelectedTool(addTextNodeTool());
					break;
				case "f":
					setSelectedTool(addFileNodeTool());
					break;
				case "g":
					setSelectedTool(addTextGenerationNodeTool());
					break;
			}
			if (event.code === "Escape") {
				setSelectedTool(moveTool());
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [setSelectedTool]);

	return <></>;
}
