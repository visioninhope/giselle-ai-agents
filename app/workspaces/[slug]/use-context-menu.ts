import { type MouseEventHandler, useCallback, useState } from "react";

interface ContextMenuPosition {
	x: number;
	y: number;
}

export const useContextMenu = () => {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

	const showContextMenu = useCallback((x: number, y: number) => {
		setPosition({ x, y });
		setIsVisible(true);
	}, []);

	const handleContextMenu: MouseEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault();
		showContextMenu(event.clientX, event.clientY);
	};

	const hideContextMenu = useCallback(() => {
		setIsVisible(false);
	}, []);

	return {
		isVisible,
		position,
		showContextMenu,
		hideContextMenu,
		handleContextMenu,
	};
};
