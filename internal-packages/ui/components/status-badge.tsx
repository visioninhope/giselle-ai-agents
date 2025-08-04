import clsx from "clsx/lite";

interface StatusBadgeProps {
	status: "error" | "success" | "ignored" | "info" | "warning";
	className?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export function StatusBadge({
	status,
	className,
	leftIcon,
	rightIcon,
	children,
}: React.PropsWithChildren<StatusBadgeProps>) {
	return (
		<div
			className={clsx(
				"px-[8px] py-[2px] rounded-[4px] text-[12px] w-fit flex items-center gap-[4px]",
				className,
			)}
			data-variant={status}
			style={{
				backgroundColor: `color-mix(in srgb, var(--color-${status}) 5%, transparent)`,
				color: `var(--color-${status})`,
				border: `1px solid color-mix(in srgb, var(--color-${status}) 10%, transparent)`,
			}}
		>
			{leftIcon && <div className="*:size-[12px]">{leftIcon}</div>}
			{children}
			{rightIcon && <div className="*:size-[12px]">{rightIcon}</div>}
		</div>
	);
}
