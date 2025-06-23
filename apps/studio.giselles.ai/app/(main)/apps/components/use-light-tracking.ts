"use client";

import { useEffect, useRef } from "react";
import { CSS_VARS, EASING, LIGHT_TRACKING } from "./constants";
import type { Position } from "./types";
import { createQuickSetter } from "./utils";

type UseLightTrackingReturn = {
	rootRef: React.RefObject<HTMLDivElement | null>;
	fadeRef: React.RefObject<HTMLDivElement | null>;
	handleMove: (e: React.PointerEvent) => void;
	handleLeave: () => void;
};

export function useLightTracking(): UseLightTrackingReturn {
	const rootRef = useRef<HTMLDivElement>(null);
	const fadeRef = useRef<HTMLDivElement>(null);
	const pos = useRef<Position>({ x: 0, y: 0 });
	const setX = useRef<((value: number) => void) | null>(null);
	const setY = useRef<((value: number) => void) | null>(null);
	const rafId = useRef<number | null>(null);
	const pendingUpdate = useRef<Position | null>(null);

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;

		// Initialize CSS variable setters
		setX.current = createQuickSetter(el, CSS_VARS.x);
		setY.current = createQuickSetter(el, CSS_VARS.y);

		// Set initial position to center
		const { width, height } = el.getBoundingClientRect();
		const initialPos = { x: width / 2, y: height / 2 };
		pos.current = initialPos;

		if (setX.current && setY.current) {
			setX.current(initialPos.x);
			setY.current(initialPos.y);
		}

		return () => {
			if (rafId.current !== null) {
				cancelAnimationFrame(rafId.current);
			}
			setX.current = null;
			setY.current = null;
		};
	}, []);

	const updatePosition = (newPos: Position) => {
		pendingUpdate.current = newPos;

		if (rafId.current !== null) return;

		rafId.current = requestAnimationFrame(() => {
			if (pendingUpdate.current && setX.current && setY.current) {
				pos.current = pendingUpdate.current;
				setX.current(pendingUpdate.current.x);
				setY.current(pendingUpdate.current.y);
				pendingUpdate.current = null;
			}
			rafId.current = null;
		});
	};

	const fadeTo = (opacity: number, duration: number) => {
		if (!fadeRef.current) return;

		fadeRef.current.style.transition = `opacity ${duration}ms ${EASING.smooth}`;
		fadeRef.current.style.opacity = String(opacity);
	};

	const handleMove = (e: React.PointerEvent) => {
		if (!rootRef.current) return;

		const rect = rootRef.current.getBoundingClientRect();
		const newPos = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};

		updatePosition(newPos);
		fadeTo(0, LIGHT_TRACKING.fadeInDuration);
	};

	const handleLeave = () => {
		fadeTo(1, LIGHT_TRACKING.fadeOutDuration);
	};

	return {
		rootRef,
		fadeRef,
		handleMove,
		handleLeave,
	};
}
