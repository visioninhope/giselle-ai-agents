import { Button } from "@giselle-internal/ui/button";
import { PopoverContent } from "@giselle-internal/ui/popover";
import { Copy } from "lucide-react";
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
			className="fixed z-[1000]"
			role="menu"
			aria-label="Node actions"
		>
			<PopoverContent>
				<Button
					variant="subtle"
					size="default"
					onClick={handleDuplicate}
					className="w-full justify-start"
					leftIcon={<Copy />}
				>
					Duplicate Node
				</Button>
			</PopoverContent>
		</div>
	);
}
