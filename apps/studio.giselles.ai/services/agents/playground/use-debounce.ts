// useDebounce.ts
import { useCallback, useEffect, useRef } from "react";

type Timer = ReturnType<typeof setTimeout>;

// biome-ignore lint: lint/suspicious/noExplicitAny
export function useDebounce<T extends (...args: any[]) => any>(
	callback: T,
	delay: number,
): T {
	const timeoutRef = useRef<Timer | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		(...args: Parameters<T>) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay],
	) as T;
}
