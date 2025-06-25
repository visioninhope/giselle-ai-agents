import clsx from "clsx/lite";

type ButtonStyle = "subtle" | "filled" | "solid" | "glassmorphic";
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
				"flex items-center justify-between gap-[4px] outline-none overflow-hidden",
				"data-[size=default]:px-[8px] data-[size=default]:py-[2px] data-[size=default]:rounded-[2px] ",
				"data-[size=large]:px-4 data-[size=large]:py-2 data-[size=large]:rounded-lg",
				"data-[style=subtle]:hover:bg-ghost-element-hover",
				"data-[style=filled]:bg-background data-[style=filled]:border data-[style=filled]:border-border data-[style=filled]:hover:bg-ghost-element-hover",
				"data-[style=solid]:bg-primary-900 data-[style=solid]:text-white-900 data-[style=solid]:border data-[style=solid]:border-primary-800 data-[style=solid]:hover:bg-primary-800",
				"data-[style=glassmorphic]:shadow-glassmorphic data-[style=glassmorphic]:relative data-[style=glassmorphic]:bg-linear-[135deg] data-[style=glassmorphic]:from-glassmorphic-bg-gradient-from data-[style=glassmorphic]:via-glassmorphic-bg-gradient-via data-[style=glassmorphic]:to-glassmorphic-bg-gradient-to data-[style=glassmorphic]:backdrop-blur-md",
				"data-[style=glassmorphic]:after:absolute data-[style=glassmorphic]:after:bg-linear-to-r  data-[style=glassmorphic]:after:from-transparentl  data-[style=glassmorphic]:after:via-glassmorphic-highlight/60 data-[style=glassmorphic]:after:left-4 data-[style=glassmorphic]:after:right-4 data-[style=glassmorphic]:after:h-px data-[style=glassmorphic]:after:top-0",
				"data-[style=glassmorphic]:border data-[style=glassmorphic]:border-glassmorphic-border/20",
				"cursor-pointer transition-colors",
				className,
			)}
			data-style={style}
			data-size={size}
			{...props}
		>
			{leftIcon && <div className="*:size-[13px] *:text-text">{leftIcon}</div>}
			<div className="text-[13px] text-text">{children}</div>
			{rightIcon && <div className="*:size-[13px]">{rightIcon}</div>}
		</button>
	);
}
