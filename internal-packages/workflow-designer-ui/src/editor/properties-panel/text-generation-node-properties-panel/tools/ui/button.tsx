import clsx from "clsx/lite";

type ButtonStyle = "subtle" | "filled";
interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	variant?: ButtonStyle;
}

export function Button({
	className,
	children,
	leftIcon,
	rightIcon,
	variant: style = "subtle",
	...props
}: ButtonProps) {
	console.log(style);
	return (
		<button
			className={clsx(
				"flex items-center gap-[4px] px-[8px] py-[2px] rounded-[2px] outline-none",
				"data-[style=filled]:bg-background data-[style=filled]:border data-[style=filled]:border-border",
				"cursor-pointer hover:bg-ghost-element-hover transition-colors",
				className,
			)}
			data-style={style}
			{...props}
		>
			{leftIcon}
			<div className="text-[13px] text-text">{children}</div>
			{rightIcon}
		</button>
	);
}
