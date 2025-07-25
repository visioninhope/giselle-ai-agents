import clsx from "clsx/lite";

interface StatusBadgeProps {
	status: "error" | "success" | "ignored" | "info";
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
				"data-[variant=error]:bg-error/40 data-[variant=error]:text-error",
				"data-[variant=success]:bg-success/40 data-[variant=success]:text-success",
				"data-[variant=info]:bg-info/40 data-[variant=info]:text-info",
				"data-[variant=ignored]:bg-ignored/40 data-[variant=ignored]:text-ignored",
				className,
			)}
			data-variant={status}
		>
			{leftIcon && <div className="*:size-[12px]">{leftIcon}</div>}
			{children}
			{rightIcon && <div className="*:size-[12px]">{rightIcon}</div>}
		</div>
	);
}
