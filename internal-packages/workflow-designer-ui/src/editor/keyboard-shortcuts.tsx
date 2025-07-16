import type { Node, NodeLike } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "@giselle-sdk/giselle-engine/react";
import { useEffect, useState } from "react";
import { useDuplicateNode } from "./node";
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
	const { data, copyNode } = useWorkflowDesigner();
	const duplicateNode = useDuplicateNode();
	const [copiedNode, setCopiedNode] = useState<NodeLike | null>(null);
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
				const selectedNode = data.nodes.find(
					(node) => data.ui.nodeState[node.id]?.selected,
				);
				if (selectedNode) {
					setCopiedNode(selectedNode);
				}
				return;
			}

			if ((event.metaKey || event.ctrlKey) && event.key === "v") {
				event.preventDefault();
				if (copiedNode) {
					const nodeState = data.ui.nodeState[copiedNode.id];
					if (nodeState) {
						const position = {
							x: nodeState.position.x + 200,
							y: nodeState.position.y + 100,
						};
						// Type guard: ensure copiedNode is a proper Node, not just NodeLike
						if (
							copiedNode.type === "operation" ||
							copiedNode.type === "variable"
						) {
							copyNode(copiedNode as Node, { ui: { position } });
						}
					}
				}
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
	}, [duplicateNode, data, copyNode, copiedNode, toolbar]);

	return null;
}
