import { useWorkflowDesigner } from "@giselle-sdk/giselle/react";
import { useKeyPress } from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { useCopyPasteNode, useDuplicateNode } from "../node";
import {
	moveTool,
	selectActionTool,
	selectLanguageModelTool,
	selectRetrievalCategoryTool,
	selectSourceCategoryTool,
	selectTriggerTool,
	useToolbar,
} from "../tool/toolbar";

export function useKeyboardShortcuts() {
	const duplicateNode = useDuplicateNode();
	const toolbar = useToolbar();
	const { data } = useWorkflowDesigner();
	const { copy: handleCopy, paste: handlePaste } = useCopyPasteNode();

	// Keep track of key press state to detect keydown (not held)
	const wasPressed = useRef<{ [key: string]: boolean }>({});

	// Use React Flow's useKeyPress hook with proper options
	const tPressed = useKeyPress("t", { actInsideInputWithModifier: false });
	const iPressed = useKeyPress("i", { actInsideInputWithModifier: false });
	const gPressed = useKeyPress("g", { actInsideInputWithModifier: false });
	const rPressed = useKeyPress("r", { actInsideInputWithModifier: false });
	const dPressed = useKeyPress("d", { actInsideInputWithModifier: false });
	const escapePressed = useKeyPress("Escape", {
		actInsideInputWithModifier: false,
	});

	// Only use keyboard shortcuts when canvas is focused
	const canUseShortcuts = data.ui.focusedArea === "canvas";

	// For modifier key shortcuts - conditionally use them
	const cmdCPressed = useKeyPress(
		canUseShortcuts ? ["Meta+c", "Control+c"] : null,
		{ actInsideInputWithModifier: false },
	);
	const cmdVPressed = useKeyPress(
		canUseShortcuts ? ["Meta+v", "Control+v"] : null,
		{ actInsideInputWithModifier: false },
	);
	const cmdDPressed = useKeyPress(
		canUseShortcuts ? ["Meta+d", "Control+d"] : null,
		{ actInsideInputWithModifier: false },
	);

	// Handle tool shortcuts
	useEffect(() => {
		if (data.ui.focusedArea !== "canvas" || !toolbar) return;

		if (tPressed && !wasPressed.current.t) {
			toolbar.setSelectedTool(selectTriggerTool());
		} else if (iPressed && !wasPressed.current.i) {
			toolbar.setSelectedTool(selectSourceCategoryTool());
		} else if (gPressed && !wasPressed.current.g) {
			toolbar.setSelectedTool(selectLanguageModelTool());
		} else if (rPressed && !wasPressed.current.r) {
			toolbar.setSelectedTool(selectRetrievalCategoryTool());
		} else if (dPressed && !wasPressed.current.d) {
			toolbar.setSelectedTool(selectActionTool());
		} else if (escapePressed && !wasPressed.current.escape) {
			toolbar.setSelectedTool(moveTool());
		}

		// Update pressed state
		wasPressed.current.t = tPressed;
		wasPressed.current.i = iPressed;
		wasPressed.current.g = gPressed;
		wasPressed.current.r = rPressed;
		wasPressed.current.d = dPressed;
		wasPressed.current.escape = escapePressed;
	}, [
		tPressed,
		iPressed,
		gPressed,
		rPressed,
		dPressed,
		escapePressed,
		toolbar,
		data.ui.focusedArea,
	]);

	// Handle copy/paste/duplicate shortcuts
	useEffect(() => {
		// Only handle shortcuts when canvas is focused
		if (data.ui.focusedArea !== "canvas") return;

		if (cmdCPressed && !wasPressed.current.cmdC) {
			handleCopy();
		} else if (cmdVPressed && !wasPressed.current.cmdV) {
			handlePaste();
		} else if (cmdDPressed && !wasPressed.current.cmdD) {
			duplicateNode();
		}

		// Update pressed state
		wasPressed.current.cmdC = cmdCPressed;
		wasPressed.current.cmdV = cmdVPressed;
		wasPressed.current.cmdD = cmdDPressed;
	}, [
		cmdCPressed,
		cmdVPressed,
		cmdDPressed,
		handleCopy,
		handlePaste,
		duplicateNode,
		data.ui.focusedArea,
	]);

	// Return handler for preventing default on Cmd+D
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			// Only handle Cmd+D when focused on canvas
			if (
				data.ui.focusedArea === "canvas" &&
				(event.metaKey || event.ctrlKey) &&
				event.key.toLowerCase() === "d"
			) {
				event.preventDefault();
			}
		},
		[data.ui.focusedArea],
	);

	return { handleKeyDown };
}
