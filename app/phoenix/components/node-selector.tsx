import { type DragEvent, type FC, type ReactNode, useCallback } from "react";
import { useDnD } from "../contexts/drag-and-drop";
import { ListItem } from "./list-item";

type NodeSelectorProps = {
	icon: ReactNode;
	nodeClassName: string;
	label: string;
};

export const NodeSelector: FC<NodeSelectorProps> = ({
	icon,
	nodeClassName,
	label,
}) => {
	const { setDragPayload } = useDnD();

	const handleDragStart = useCallback(
		(nodeClassName: string) => (event: DragEvent<HTMLDivElement>) => {
			if (event == null) {
				return;
			}
			event.dataTransfer.effectAllowed = "move";
			setDragPayload(nodeClassName);
		},
		[setDragPayload],
	);

	return <ListItem icon={icon} title={label} />;
};
