import { type ReactNode, useEffect } from "react";
import { useToolbar } from "../contexts/toolbar";

export function KeyboardShortcut() {
	const { selectTool } = useToolbar();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
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
