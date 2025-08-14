import { useWorkflowDesigner } from "@giselle-sdk/giselle/react";
import { useKeyPress } from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
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

export function useKeyboardShortcuts() {
	const toolbar = useToolbar();
	const { data } = useWorkflowDesigner();
	const {
		copy: handleCopy,
		paste: handlePaste,
		duplicate: handleDuplicate,
	} = useNodeManipulation();

	const isCanvasFocused = data.ui.focusedArea === "canvas";
	const canUseToolShortcuts = isCanvasFocused && !!toolbar;

	// Tool shortcuts using the custom hook
	useKeyAction(
		"t",
		() => toolbar?.setSelectedTool(selectTriggerTool()),
		canUseToolShortcuts,
	);
	useKeyAction(
		"i",
		() => toolbar?.setSelectedTool(selectSourceCategoryTool()),
		canUseToolShortcuts,
	);
	useKeyAction(
		"g",
		() => toolbar?.setSelectedTool(selectLanguageModelTool()),
		canUseToolShortcuts,
	);
	useKeyAction(
		"r",
		() => toolbar?.setSelectedTool(selectRetrievalCategoryTool()),
		canUseToolShortcuts,
	);
	useKeyAction(
		"d",
		() => toolbar?.setSelectedTool(selectActionTool()),
		canUseToolShortcuts,
	);
	useKeyAction(
		"Escape",
		() => toolbar?.setSelectedTool(moveTool()),
		canUseToolShortcuts,
	);

	// Copy/Paste/Duplicate shortcuts
	useKeyAction(["Meta+c", "Control+c"], handleCopy, isCanvasFocused);
	useKeyAction(["Meta+v", "Control+v"], handlePaste, isCanvasFocused);
	useKeyAction(["Meta+d", "Control+d"], handleDuplicate, isCanvasFocused);

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

	return { handleKeyDown };
}
