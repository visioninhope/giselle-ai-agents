import clsx from "clsx/lite";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export function Button({
	className,
	children,
	leftIcon,
	rightIcon,
	...props
}: ButtonProps) {
	return (
		<button
			className={clsx(
				"flex items-center gap-[4px] hover:bg-ghost-element-hover transition-colors px-[8px] py-[2px] rounded-[2px] cursor-pointer outline-none",
				className,
			)}
			{...props}
		>
			{leftIcon}
			<div className="text-[13px] text-text">{children}</div>
			{rightIcon}
		</button>
	);
}
