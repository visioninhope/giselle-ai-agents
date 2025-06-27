import clsx from "clsx/lite";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { PropsWithChildren } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ children }: PropsWithChildren) {
	return (
		<DialogPortal>
			<DialogPrimitive.Overlay className="fixed inset-0 bg-black/60 z-20" />
			<DialogPrimitive.Content
				className={clsx(
					"fixed left-[50%] top-[15%] translate-x-[-50%] w-[400px] z-20 overflow-hidden outline-none",
					"bg-(image:--glass-bg)",
					"border border-glass-border/20 shadow-xl text-text",
					"px-6 rounded-[12px]",
					"backdrop-blur-md",
					"after:absolute after:bg-(image:--glass-highlight-bg) after:left-4 after:right-4 after:h-px after:top-0",
				)}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

export function DialogTitle({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<DialogPrimitive.Title className={clsx("text-[14px]", className)}>
			{children}
		</DialogPrimitive.Title>
	);
}
export function DialogDescription({ children }: PropsWithChildren) {
	return (
		<DialogPrimitive.Description className="text-[13px] text-text-muted">
			{children}
		</DialogPrimitive.Description>
	);
}

export function DialogFooter({ children }: PropsWithChildren) {
	return (
		<div className={clsx("px-3 py-[8px] flex justify-end -mx-6 mt-[12px]")}>
			{children}
		</div>
	);
}
