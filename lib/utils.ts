import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isEmailFromRoute06 = (email: string): boolean => {
	const domain = email.split("@")[1];
	return domain ? domain.endsWith("route06.co.jp") : false;
};
