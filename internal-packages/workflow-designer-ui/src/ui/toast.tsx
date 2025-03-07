"use client";

import clsx from "clsx/lite";
import { XIcon } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
	id: string;
	message: string;
	type?: "info" | "success" | "warning" | "error";
	preserve?: boolean;
}

interface ToastContextType {
	error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
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

	const addToast = useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substring(2);
		const newToast = {
			...toast,
			id,
		};

		setToasts((prevToasts) => [...prevToasts, newToast]);
	}, []);

	const error = useCallback(
		(message: string) => {
			addToast({ message, type: "error", preserve: true });
		},
		[addToast],
	);

	return (
		<ToastContext.Provider value={{ error }}>
			<ToastPrimitive.Provider swipeDirection="right">
				{children}
				{toasts.map((toast) => (
					<ToastPrimitive.Root
						key={toast.id}
						className={clsx(
							"relative rounded-[8px] bg-black-900/60",
							"data-[type=error]:bg-error-900/60",
						)}
						data-type={toast.type}
						duration={toast.preserve ? Number.POSITIVE_INFINITY : undefined}
					>
						<div className="relative text-white-900 px-[16px] py-[16px] flex justify-between items-center gap-[4px]">
							<ToastPrimitive.Title className="text-[14px] flex items-center gap-[8px]">
								{toast.message}
							</ToastPrimitive.Title>
							<ToastPrimitive.Close className="rounded-[8px] hover:bg-white-900/10 p-[4px] transition-colors">
								<XIcon size={18} />
							</ToastPrimitive.Close>
						</div>
					</ToastPrimitive.Root>
				))}
				<ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-2147483647 m-0 flex w-[520px] max-w-[100vw] list-none flex-col gap-2.5 p-[40px] outline-hidden" />
			</ToastPrimitive.Provider>
		</ToastContext.Provider>
	);
};
