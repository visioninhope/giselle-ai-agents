import { useCallback } from "react";
import { useToasts } from "../../ui/toast";
import { useDuplicateNode } from "../node";
import type { ContextMenuProps } from "./types";

export function ContextMenu({
	id,
	top,
	left,
	right,
	bottom,
	onClose,
}: ContextMenuProps) {
	const duplicateNode = useDuplicateNode();
	const toast = useToasts();

	const handleDuplicate = useCallback(() => {
		duplicateNode(id, () => toast.error("Failed to duplicate node"));
		onClose();
	}, [id, duplicateNode, toast, onClose]);

	return (
		<div
			style={{ top, left, right, bottom }}
			className="fixed bg-[#1a1a1a] border border-[#333] rounded-md p-1 z-[1000] shadow-lg"
			role="menu"
			aria-label="Node actions"
		>
			<button
				type="button"
				className="w-full px-3 py-2 text-white bg-transparent border-none cursor-pointer text-left whitespace-nowrap hover:bg-[#333] focus:outline-none focus:bg-[#444] rounded-sm block"
				onClick={handleDuplicate}
				role="menuitem"
			>
				Duplicate Node
			</button>
		</div>
	);
}
