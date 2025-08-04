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
			className={clsx("rounded-[4px] p-[1px] w-fit", className)}
			data-variant={status}
		>
			<div
				className="px-[8px] py-[2px] rounded-[3px] text-[12px] flex items-center gap-[4px]"
				style={{
					backgroundColor: `rgba(var(--color-${status}-rgb, ${status === "error" ? "255, 61, 113" : status === "success" ? "57, 255, 127" : status === "warning" ? "255, 229, 81" : status === "info" ? "54, 123, 253" : "135, 138, 152"}), 0.05)`,
					color: `var(--color-${status}, ${status === "error" ? "#ff3d71" : status === "success" ? "#39ff7f" : status === "warning" ? "#ffe551" : status === "info" ? "#367bfd" : "#878a98"})`,
					border: `1px solid rgba(var(--color-${status}-rgb, ${status === "error" ? "255, 61, 113" : status === "success" ? "57, 255, 127" : status === "warning" ? "255, 229, 81" : status === "info" ? "54, 123, 253" : "135, 138, 152"}), 0.1)`,
				}}
			>
				{leftIcon && <div className="*:size-[12px]">{leftIcon}</div>}
				{children}
				{rightIcon && <div className="*:size-[12px]">{rightIcon}</div>}
			</div>
		</div>
	);
}
