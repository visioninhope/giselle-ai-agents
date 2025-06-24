"use client";

import clsx from "clsx/lite";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface OverlayDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: string;
	width?: number;
	position?: "right" | "left";
}

export function OverlayDrawer({
	isOpen,
	onClose,
	children,
	title,
	width = 400,
	position = "right",
}: OverlayDrawerProps) {
	const drawerRef = useRef<HTMLDivElement>(null);

	// Close on Escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			// Prevent body scroll when drawer is open
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				drawerRef.current &&
				!drawerRef.current.contains(event.target as Node) &&
				isOpen
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const drawerContent = (
		<div className="fixed inset-0 z-50 flex">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onClose();
					}
				}}
				role="button"
				tabIndex={0}
			/>

			{/* Drawer */}
			<div
				ref={drawerRef}
				className={clsx(
					"relative bg-surface-background border-l border-border shadow-2xl transition-transform duration-300 ease-out flex flex-col",
					position === "right" ? "ml-auto" : "mr-auto",
					isOpen
						? "transform-none"
						: position === "right"
							? "translate-x-full"
							: "-translate-x-full",
				)}
				style={{ width: `${width}px` }}
			>
				{/* Header */}
				{title && (
					<div className="flex items-center justify-between p-4 border-b border-border bg-surface-background">
						<h2 className="text-lg font-semibold text-white-900">{title}</h2>
						<button
							type="button"
							onClick={onClose}
							className="p-1 rounded-md hover:bg-surface-hover transition-colors"
							aria-label="Close drawer"
						>
							<svg
								className="w-5 h-5 text-white-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Close</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 overflow-hidden">{children}</div>
			</div>
		</div>
	);

	// Render to portal to ensure it's on top of everything
	return typeof window !== "undefined"
		? createPortal(drawerContent, document.body)
		: null;
}

export function OverlayDrawerTrigger({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center justify-center"
		>
			{children}
		</button>
	);
}
