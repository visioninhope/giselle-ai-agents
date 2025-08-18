import { isFileNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "@giselle-sdk/giselle/react";
import { useKeyPress } from "@xyflow/react";
import { type RefObject, useCallback, useEffect, useRef } from "react";
import { useNodeManipulation } from "../node";
import {
	moveTool,
	selectActionTool,
	selectLanguageModelTool,
	selectRetrievalCategoryTool,
	selectSourceCategoryTool,
	selectTriggerTool,
	useToolbar,
} from "../tool/toolbar";
import type { Tool } from "../tool/types";

// Browser shortcuts that should be prevented when canvas is focused
const BROWSER_SHORTCUTS_TO_PREVENT = [
	{ key: "d", modifiers: ["meta", "ctrl"] }, // Bookmark
	// Add more shortcuts here as needed:
	// { key: 's', modifiers: ['meta', 'ctrl'] }, // Save page
	// { key: 'p', modifiers: ['meta', 'ctrl'] }, // Print
];

// Custom hook for handling key actions with repeat prevention
function useKeyAction(
	key: string | string[],
	action: () => void,
	enabled: boolean = false,
) {
	const wasPressed = useRef(false);
	const isPressed = useKeyPress(key, { actInsideInputWithModifier: false });

	useEffect(() => {
		if (isPressed && !wasPressed.current && enabled) {
			action();
		}
		wasPressed.current = isPressed;
	}, [isPressed, enabled, action]);
}

function useToolAction(key: string, toolFunction: () => Tool) {
	const toolbar = useToolbar();
	const { data } = useWorkflowDesigner();
	const isCanvasFocused = data.ui.currentShortcutScope === "canvas";
	const canUseToolShortcuts = isCanvasFocused && !!toolbar;

	useKeyAction(
		key,
		() => toolbar?.setSelectedTool(toolFunction()),
		canUseToolShortcuts,
	);
}

export function useKeyboardShortcuts() {
	const { data, uploadFile } = useWorkflowDesigner();
	const {
		copy: handleCopy,
		paste: handlePaste,
		duplicate: handleDuplicate,
	} = useNodeManipulation();

	const isCanvasFocused = data.ui.currentShortcutScope === "canvas";
	const isPropertiesPanelFocused =
		data.ui.currentShortcutScope === "properties-panel";

	// Image paste handler - moved from FilePanel
	const handleImagePasteFromClipboard = useCallback(
		(e: ClipboardEvent) => {
			// Get the currently selected node
			const selectedNode = data.nodes.find(
				(node) => data.ui.nodeState[node.id]?.selected,
			);

			if (
				!selectedNode ||
				!isFileNode(selectedNode) ||
				selectedNode.content.category !== "image"
			) {
				return;
			}

			const items = e.clipboardData?.items;
			if (!items) return;

			const imageItems: DataTransferItem[] = [];
			for (const item of items) {
				if (item.type.startsWith("image/")) {
					imageItems.push(item);
				}
			}

			if (imageItems.length === 0) return;

			// Prevent default paste behavior
			e.preventDefault();

			const files: File[] = [];
			for (const item of imageItems) {
				const file = item.getAsFile();
				if (file) {
					files.push(file);
				}
			}

			if (files.length > 0) {
				uploadFile(files, selectedNode);
			}
		},
		[data, uploadFile],
	);

	// Hook to add paste listener to specific DOM element
	const useImagePasteListener = useCallback(
		(ref: RefObject<HTMLElement>) => {
			useEffect(() => {
				const element = ref.current;
				if (!element || !isPropertiesPanelFocused) return;

				element.addEventListener("paste", handleImagePasteFromClipboard);

				return () => {
					element.removeEventListener("paste", handleImagePasteFromClipboard);
				};
			}, [ref, isPropertiesPanelFocused, handleImagePasteFromClipboard]);
		},
		[handleImagePasteFromClipboard, isPropertiesPanelFocused],
	);

	// Tool shortcuts using the simplified hook
	useToolAction("t", selectTriggerTool);
	useToolAction("i", selectSourceCategoryTool);
	useToolAction("g", selectLanguageModelTool);
	useToolAction("r", selectRetrievalCategoryTool);
	useToolAction("d", selectActionTool);
	useToolAction("Escape", moveTool);

	// Copy/Paste/Duplicate shortcuts
	useKeyAction(["Meta+c", "Control+c"], handleCopy, isCanvasFocused);
	// useKeyAction(["Meta+v", "Control+v"], handlePaste, isCanvasFocused);
	useKeyAction(["Meta+d", "Control+d"], handleDuplicate, isCanvasFocused);

	// Note: Paste for properties panel is handled by FilePanels DOM event listener
	// useKeyAction(
	// 	["Meta+v", "Control+v"],
	// 	handleImagePaste,
	// 	isPropertiesPanelFocused,
	// );

	// Return handler for preventing browser default shortcuts
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (!isCanvasFocused) return;

			const shouldPrevent = BROWSER_SHORTCUTS_TO_PREVENT.some((shortcut) => {
				const keyMatches = event.key.toLowerCase() === shortcut.key;
				const modifierMatches = shortcut.modifiers.some((mod) => {
					if (mod === "meta") return event.metaKey;
					if (mod === "ctrl") return event.ctrlKey;
					return false;
				});
				return keyMatches && modifierMatches;
			});

			if (shouldPrevent) {
				event.preventDefault();
			}
		},
		[isCanvasFocused],
	);

	return {
		handleKeyDown,
		useImagePasteListener,
	};
}
