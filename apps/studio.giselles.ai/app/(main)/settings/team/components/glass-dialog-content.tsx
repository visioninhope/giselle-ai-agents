"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";
import { buttonVariants } from "../../components/button";

export const GlassDialogContent = React.forwardRef<
	React.ElementRef<typeof Dialog.Content>,
	React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
	<Dialog.Portal>
		<Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<Dialog.Content
				ref={ref}
				className={cn(
					"relative z-10 w-[90vw] max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[12px] p-6",
					"shadow-xl focus:outline-none",
					className,
				)}
				{...props}
			>
				<div
					className="absolute inset-0 -z-10 rounded-[12px] backdrop-blur-md"
					style={{
						background:
							"linear-gradient(135deg, rgba(150, 150, 150, 0.03) 0%, rgba(60, 90, 160, 0.12) 100%)",
					}}
				/>
				<div className="absolute -z-10 top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
				<div className="absolute -z-10 inset-0 rounded-[12px] border border-white/10" />
				{children}
			</Dialog.Content>
		</div>
	</Dialog.Portal>
));
GlassDialogContent.displayName = "GlassDialogContent";

type GlassDialogHeaderProps = {
	title: string;
	description: string;
	onClose: () => void;
};

export const GlassDialogHeader = ({
	title,
	description,
	onClose,
}: GlassDialogHeaderProps) => (
	<>
		<div className="flex items-center justify-between">
			<Dialog.Title className="font-sans text-[20px] font-medium tracking-tight text-white-400">
				{title}
			</Dialog.Title>
			<Dialog.Close
				onClick={onClose}
				className="rounded-sm text-white-400 opacity-70 hover:opacity-100 focus:outline-none"
			>
				<X className="h-5 w-5" />
				<span className="sr-only">Close</span>
			</Dialog.Close>
		</div>
		<Dialog.Description className="font-geist mt-2 text-[14px] text-black-400">
			{description}
		</Dialog.Description>
	</>
);

type GlassDialogFooterProps = {
	onCancel: () => void;
	onConfirm: () => void;
	confirmLabel: string;
	isPending?: boolean;
	variant?: "default" | "destructive";
};

export const GlassDialogFooter = ({
	onCancel,
	onConfirm,
	confirmLabel,
	isPending = false,
	variant = "default",
}: GlassDialogFooterProps) => {
	return (
		<div className="mt-6 flex justify-end gap-x-3">
			<button
				type="button"
				onClick={onCancel}
				disabled={isPending}
				className={buttonVariants({ variant: "link" })}
			>
				Cancel
			</button>
			<button
				type="button"
				onClick={onConfirm}
				disabled={isPending}
				className={buttonVariants({ variant })}
			>
				{isPending ? "Processing..." : confirmLabel}
			</button>
		</div>
	);
}; 