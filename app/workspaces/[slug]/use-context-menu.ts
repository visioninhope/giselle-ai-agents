import { type MouseEventHandler, useCallback, useState } from "react";

interface ContextMenuPosition {
	x: number;
	y: number;
}

export const useContextMenu = () => {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

	const toggleContextMenu = useCallback(
		(x: number, y: number) => {
			if (isVisible) {
				setIsVisible(false);
				return;
			}
			setPosition({ x, y });
			setIsVisible(true);
		},
		[isVisible],
	);

	const handleContextMenu: MouseEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			event.preventDefault();
			console.log("handle!");
			toggleContextMenu(event.clientX, event.clientY);
		},
		[toggleContextMenu],
	);

	const hideContextMenu = useCallback(() => {
		setIsVisible(false);
	}, []);

	return {
		isVisible,
		position,
		toggleContextMenu,
		hideContextMenu,
		handleContextMenu,
	};
};
