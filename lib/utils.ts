import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isEmailFromRoute06 = (email: string): boolean => {
	const domain = email.split("@")[1];
	return domain ? domain.endsWith("route06.co.jp") : false;
};

export type withRetryOptions = {
	retries: number;
	onRetry?: (retryCount: number, error: unknown) => void;
	shouldAbort?: (error: unknown) => boolean;
};

export async function withRetry<T>(
	fn: () => Promise<T>,
	options: withRetryOptions = {
		retries: 10,
	},
): Promise<T> {
	const { retries, onRetry = () => {}, shouldAbort = () => false } = options;
	const errors: unknown[] = [];
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (error: unknown) {
			if (shouldAbort(error)) {
				throw error;
			}
			errors.push(error);
			onRetry(i, error);
		}
	}
	throw new Error("Max retries reached", { cause: errors });
}
