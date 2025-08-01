import { useEffect } from "react";
import { useCopyPasteNode, useDuplicateNode } from "./node";
import {
	moveTool,
	selectFileNodeCategoryTool,
	selectLanguageModelTool,
	selectRetrievalCategoryTool,
	selectSourceCategoryTool,
	useToolbar,
} from "./tool/toolbar";

const ignoredTags = ["INPUT", "TEXTAREA", "SELECT"];

export function KeyboardShortcuts() {
	const duplicateNode = useDuplicateNode();
	const { copy, paste } = useCopyPasteNode();
	const toolbar = useToolbar();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const activeElement = document.activeElement as HTMLElement | null;

			if (
				activeElement &&
				(ignoredTags.includes(activeElement.tagName) ||
					activeElement.isContentEditable)
			) {
				return;
			}

			if ((event.metaKey || event.ctrlKey) && event.key === "d") {
				event.preventDefault();
				duplicateNode();
				return;
			}

			if ((event.metaKey || event.ctrlKey) && event.key === "c") {
				event.preventDefault();
				copy();
				return;
			}

			if ((event.metaKey || event.ctrlKey) && event.key === "v") {
				event.preventDefault();
				paste();
				return;
			}

			// Tool selection shortcuts (only if toolbar is available)
			if (toolbar) {
				switch (event.key) {
					case "g":
						toolbar.setSelectedTool(selectLanguageModelTool());
						break;
					case "s":
						toolbar.setSelectedTool(selectSourceCategoryTool());
						break;
					case "u":
						toolbar.setSelectedTool(selectFileNodeCategoryTool());
						break;
					case "r":
						toolbar.setSelectedTool(selectRetrievalCategoryTool());
						break;
				}
				if (event.code === "Escape") {
					toolbar.setSelectedTool(moveTool());
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [duplicateNode, copy, paste, toolbar]);

	return null;
}
