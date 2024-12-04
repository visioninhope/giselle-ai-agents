import { type ReactNode, useEffect } from "react";
import { useToolbar } from "../contexts/toolbar";

const ignoredTags = ["INPUT", "TEXTAREA", "SELECT"];

export function KeyboardShortcut() {
	const { selectTool } = useToolbar();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const activeElement = document.activeElement;
			const tagName = activeElement?.tagName;

			if (tagName !== undefined && ignoredTags.includes(tagName)) {
				return;
			}
			switch (event.key) {
				case "v":
					selectTool("move");
					break;
				case "t":
					selectTool("addTextNode");
					break;
				case "f":
					selectTool("addFileNode");
					break;
				case "g":
					selectTool("addTextGenerationNode");
					break;
			}
			if (event.code === "Escape") {
				selectTool("move");
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectTool]);

	return <></>;
}
