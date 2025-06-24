"use client";

import clsx from "clsx/lite";
import { type ReactNode, useCallback, useRef, useState } from "react";

interface FloatingPropertiesPanelProps {
	isOpen: boolean;
	children: ReactNode;
	className?: string;
	defaultWidth?: number;
	minWidth?: number;
	maxWidth?: number;
}

export function FloatingPropertiesPanel({
	isOpen,
	children,
	className,
	defaultWidth = 400,
	minWidth = 300,
	maxWidth = 800,
}: FloatingPropertiesPanelProps) {
	const [width, setWidth] = useState(defaultWidth);
	const [isResizing, setIsResizing] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsResizing(true);

			const startX = e.clientX;
			const startWidth = width;

			const handleMouseMove = (e: MouseEvent) => {
				const deltaX = startX - e.clientX; // Left resize, so subtract
				const newWidth = Math.max(
					minWidth,
					Math.min(maxWidth, startWidth + deltaX),
				);
				setWidth(newWidth);
			};

			const handleMouseUp = () => {
				setIsResizing(false);
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		},
		[width, minWidth, maxWidth],
	);

	if (!isOpen) return null;

	return (
		<div
			className="absolute top-4 right-4 bottom-4 z-10 pointer-events-none"
			style={{ width: `${width}px` }}
		>
			<div
				ref={panelRef}
				className={clsx(
					"h-full bg-surface-background border border-border rounded-lg shadow-2xl pointer-events-auto relative",
					"transform transition-all duration-300 ease-out",
					isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
					className,
				)}
			>
				{/* Resize handle */}
				<div
					className={clsx(
						"absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors",
						"bg-transparent hover:bg-opacity-50",
						isResizing && "bg-blue-500 bg-opacity-50",
					)}
					onMouseDown={handleMouseDown}
				/>

				{/* Content */}
				<div className="h-full overflow-hidden pl-1">{children}</div>
			</div>
		</div>
	);
}
