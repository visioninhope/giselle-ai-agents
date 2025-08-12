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

interface UseKeyboardShortcutsOptions {
	onGenerate?: () => void;
}

export function useKeyboardShortcuts(
	options: UseKeyboardShortcutsOptions = {},
) {
	const toolbar = useToolbar();
	const { data } = useWorkflowDesigner();
	const {
		copy: handleCopy,
		paste: handlePaste,
		duplicate: handleDuplicate,
	} = useNodeManipulation();
	const { onGenerate } = options;

	// Only use keyboard shortcuts when canvas is focused
	const canUseShortcuts = data.ui.focusedArea === "canvas";
	const canUseToolShortcuts = canUseShortcuts && !!toolbar;
	// Properties panel shortcuts
	const canUsePropertiesShortcuts = data.ui.focusedArea === "properties-panel";

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

	// Generate shortcut for properties panel
	useKeyAction(
		["Meta+Enter", "Control+Enter"],
		() => onGenerate?.(),
		canUsePropertiesShortcuts && !!onGenerate,
	);

	// Copy/Paste/Duplicate shortcuts
	useKeyAction(["Meta+c", "Control+c"], handleCopy, canUseShortcuts);
	useKeyAction(["Meta+v", "Control+v"], handlePaste, canUseShortcuts);
	useKeyAction(["Meta+d", "Control+d"], handleDuplicate, canUseShortcuts);

	// Return handler for preventing browser default shortcuts
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			// Only prevent defaults when focused on canvas
			if (data.ui.focusedArea !== "canvas") return;

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
		[data.ui.focusedArea],
	);

	return { handleKeyDown };
}
