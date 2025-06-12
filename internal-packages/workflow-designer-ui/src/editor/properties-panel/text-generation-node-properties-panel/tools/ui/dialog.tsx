import clsx from "clsx/lite";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { PropsWithChildren, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogTrigger({
	icon,
	children,
}: PropsWithChildren<{ icon: ReactNode }>) {
	return (
		<DialogPrimitive.Trigger asChild>
			<button
				type="button"
				className={clsx(
					"flex items-center gap-[4px] text-[14px] text-text hover:bg-ghost-element-hover transition-colors px-[8px] py-[2px] rounded-[2px] cursor-pointer outline-none",
					"**:data-dialog-trigger-icon:size-[14px]",
				)}
			>
				{icon}
				<span>{children}</span>
			</button>
		</DialogPrimitive.Trigger>
	);
}

export function DialogContent({ children }: PropsWithChildren) {
	return (
		<DialogPortal>
			<DialogPrimitive.Content
				className={clsx(
					"fixed left-[50%] top-[15%] translate-x-[-50%] w-[400px] z-20 overflow-hidden outline-none",
					"rounded-[10px] bg-panel-background",
					"border border-border-variant shadow-2xl/50 text-text",
				)}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

export function DialogTitle({ children }: PropsWithChildren) {
	return (
		<DialogPrimitive.Title className="px-[12px] text-[14px]">
			{children}
		</DialogPrimitive.Title>
	);
}
export function DialogDescription({ children }: PropsWithChildren) {
	return (
		<DialogPrimitive.Description className="px-[12px] text-[13px] text-text-muted">
			{children}
		</DialogPrimitive.Description>
	);
}
