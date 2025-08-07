import clsx from "clsx/lite";

interface StatusBadgeProps {
	status: "error" | "success" | "ignored" | "info" | "warning";
	className?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const statusStyles = {
	error:
		"bg-[rgba(var(--color-error-rgb),0.05)] text-[var(--color-error)] border-[rgba(var(--color-error-rgb),0.1)]",
	success:
		"bg-[rgba(var(--color-success-rgb),0.05)] text-[var(--color-success)] border-[rgba(var(--color-success-rgb),0.1)]",
	warning:
		"bg-[rgba(var(--color-warning-rgb),0.05)] text-[var(--color-warning)] border-[rgba(var(--color-warning-rgb),0.1)]",
	info: "bg-[rgba(var(--color-info-rgb),0.05)] text-[var(--color-info)] border-[rgba(var(--color-info-rgb),0.1)]",
	ignored:
		"bg-[rgba(var(--color-ignored-rgb),0.05)] text-[var(--color-ignored)] border-[rgba(var(--color-ignored-rgb),0.1)]",
};

export function StatusBadge({
	status,
	className,
	leftIcon,
	rightIcon,
	children,
}: React.PropsWithChildren<StatusBadgeProps>) {
	return (
		<div
			className={clsx("rounded-[4px] p-[1px] w-fit", className)}
			data-variant={status}
		>
			<div
				className={clsx(
					"px-[8px] py-[2px] rounded-[3px] text-[12px] flex items-center gap-[4px] border",
					statusStyles[status],
				)}
			>
				{leftIcon && <div className="*:size-[12px]">{leftIcon}</div>}
				{children}
				{rightIcon && <div className="*:size-[12px]">{rightIcon}</div>}
			</div>
		</div>
	);
}
