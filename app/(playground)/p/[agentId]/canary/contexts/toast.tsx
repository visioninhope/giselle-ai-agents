"use client";

import {
	Provider as ToastComponentProvider,
	Viewport as ToastComponentViewport,
} from "@radix-ui/react-toast";
import { createContext, useContext, useState } from "react";

interface Toast {
	id: string;
	message: string;
	type?: "info" | "success" | "warning" | "error";
	duration?: number;
}

interface ToastContextType {
	toasts: Toast[];
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substring(2);
		const newToast = {
			...toast,
			id,
			duration: toast.duration || 3000,
		};

		setToasts((prevToasts) => [...prevToasts, newToast]);

		setTimeout(() => {
			removeToast(id);
		}, newToast.duration);
	};

	const removeToast = (id: string) => {
		setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
	};

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			<ToastComponentProvider swipeDirection="right">
				{children}
				<ToastComponentViewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
			</ToastComponentProvider>
		</ToastContext.Provider>
	);
};
