import clsx from "clsx/lite";

type ButtonStyle = "subtle" | "filled" | "solid" | "glass";
type ButtonSize = "compact" | "default" | "large";
interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	variant?: ButtonStyle;
	size?: ButtonSize;
}

export function Button({
	className,
	children,
	leftIcon,
	rightIcon,
	variant: style = "subtle",
	size = "default",
	...props
}: ButtonProps) {
	return (
		<button
			className={clsx(
				"relative flex items-center justify-between gap-[4px] outline-none overflow-hidden",
				"data-[size=default]:px-[8px] data-[size=default]:py-[2px] data-[size=default]:rounded-[2px] ",
				"data-[size=large]:px-4 data-[size=large]:py-2 data-[size=large]:rounded-lg",
				"data-[style=subtle]:hover:bg-ghost-element-hover",
				"data-[style=filled]:bg-background data-[style=filled]:border data-[style=filled]:border-border data-[style=filled]:hover:bg-ghost-element-hover",
				"data-[style=solid]:bg-(image:--solid-button-bg) data-[style=solid]:text-white-900 data-[style=solid]:border data-[style=solid]:border-button-solid-border data-[style=solid]:shadow-(--solid-button-shadow) data-[style=solid]:hover:bg-primary-800",
				"data-[glass]:shadow-glass data-[sglass]:backdrop-blur-md",
				"data-[glass]:after:absolute data-[sglass]:after:bg-linear-to-r data-[glass]:after:from-transparent data-[sglass]:after:via-glass-highlight/60 data-[glass]:after:left-4 data-[sglass]:after:right-4 data-[glass]:after:h-px data-[sglass]:after:top-0",
				"data-[glass]:border data-[sglass]:border-glass-border/20",
				"cursor-pointer transition-colors",
				className,
			)}
			data-style={style}
			data-size={size}
			{...props}
		>
			{style === "glass" && (
				<>
					<div className="absolute inset-0 bg-(image:--glass-bg-default)" />
					<div className="absolute inset-0 bg-(image:--glass-bg-hover) opacity-0 hover:opacity-100 transition-opacity" />
				</>
			)}
			{leftIcon && <div className="*:size-[13px] *:text-text">{leftIcon}</div>}
			<div className="text-[13px] text-text">{children}</div>
			{rightIcon && <div className="*:size-[13px]">{rightIcon}</div>}
		</button>
	);
}
