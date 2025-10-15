"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../../components/button";

type GlassDialogContentProps = React.ComponentPropsWithoutRef<
	typeof Dialog.Content
> & {
	variant?: "default" | "destructive";
	borderStyle?: "gradient" | "solid";
};

export const GlassDialogContent = React.forwardRef<
	React.ElementRef<typeof Dialog.Content>,
	GlassDialogContentProps
>(
	(
		{
			className,
			children,
			variant = "default",
			borderStyle = "gradient",
			...props
		},
		ref,
	) => {
		const backgroundStyle =
			variant === "destructive"
				? "linear-gradient(135deg, rgba(241, 91, 108, 0.03) 0%, rgba(241, 91, 108, 0.12) 100%)"
				: "linear-gradient(135deg, rgba(150, 150, 150, 0.03) 0%, rgba(60, 90, 160, 0.12) 100%)";

		return (
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<Dialog.Content
						ref={ref}
						className={cn(
							"relative z-10 w-[90vw] max-w-[600px] max-h-[85vh] rounded-[12px] p-6 pb-20 flex flex-col",
							"shadow-xl focus:outline-none",
							className,
						)}
						{...props}
					>
						{/* base dark glass fill */}
						<div className="absolute inset-0 -z-20 rounded-[12px] bg-black-900/50" />
						{/* glass gradient fill */}
						<div
							className="absolute inset-0 -z-10 rounded-[12px] backdrop-blur-md"
							style={{ background: backgroundStyle }}
						/>
						<div className="absolute -z-10 top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
						{variant === "destructive" ? (
							<div
								className={cn(
									"absolute -z-10 inset-0 rounded-[12px] border-[0.5px] border-error-900/15",
								)}
							/>
						) : borderStyle === "solid" ? (
							<div
								className={cn(
									"absolute -z-10 inset-0 rounded-[12px] border-[0.5px] border-border",
								)}
							/>
						) : (
							<div
								className="pointer-events-none absolute inset-0 -z-10 rounded-[12px]"
								aria-hidden
								style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
							>
								<div className="absolute inset-0 rounded-[inherit] p-px">
									<div
										className="h-full w-full rounded-[inherit]"
										style={{ background: "var(--glass-stroke-gradient)" }}
									/>
								</div>
							</div>
						)}
						{children}
					</Dialog.Content>
				</div>
			</Dialog.Portal>
		);
	},
);
GlassDialogContent.displayName = "GlassDialogContent";

type GlassDialogHeaderProps = {
	title: string;
	description: string;
	onClose: () => void;
	variant?: "default" | "destructive";
};

export const GlassDialogHeader = ({
	title,
	description,
	onClose,
	variant = "default",
}: GlassDialogHeaderProps) => (
	<>
		<div className="flex items-center justify-between">
			<Dialog.Title
				className={cn(
					"font-sans text-[20px] font-medium tracking-tight text-white-400",
					{
						"text-error-900": variant === "destructive",
					},
				)}
			>
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
		<Dialog.Description
			className={cn("font-geist mt-2 text-[14px] text-black-400", {
				"text-error-900/50": variant === "destructive",
			})}
		>
			{description}
		</Dialog.Description>
	</>
);

export const GlassDialogBody = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => (
	<div
		className={cn("mt-4 mb-0 overflow-y-auto flex-1 min-h-0 pr-2", className)}
	>
		{children}
	</div>
);

type GlassDialogFooterProps = {
	onCancel: () => void;
	onConfirm?: () => void;
	confirmLabel: string;
	isPending?: boolean;
	variant?: "default" | "destructive";
	confirmButtonType?: "button" | "submit";
};

export const GlassDialogFooter = ({
	onCancel,
	onConfirm,
	confirmLabel,
	isPending = false,
	variant = "default",
	confirmButtonType = "button",
}: GlassDialogFooterProps) => {
	return (
		<div className="absolute bottom-6 left-6 right-6 flex justify-end gap-x-3">
			<button
				type="button"
				onClick={onCancel}
				disabled={isPending}
				className={buttonVariants({ variant: "link" })}
				aria-label="Cancel"
			>
				Cancel
			</button>
			<button
				type={confirmButtonType}
				onClick={onConfirm}
				disabled={isPending}
				className={cn(
					buttonVariants({
						variant: variant === "destructive" ? "destructive" : "primary",
					}),
					"whitespace-nowrap",
				)}
				aria-label={confirmLabel}
			>
				{isPending ? "Processing..." : confirmLabel}
			</button>
		</div>
	);
};
