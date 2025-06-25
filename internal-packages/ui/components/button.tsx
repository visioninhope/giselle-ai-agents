import clsx from "clsx/lite";

type ButtonStyle = "subtle" | "filled" | "solid" | "glassmorphic";
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
	return (
		<button
			className={clsx(
				"flex items-center justify-between gap-[4px] px-[8px] py-[2px] rounded-[2px] outline-none overflow-hidden",
				"data-[style=subtle]:hover:bg-ghost-element-hover",
				"data-[style=filled]:bg-background data-[style=filled]:border data-[style=filled]:border-border data-[style=filled]:hover:bg-ghost-element-hover",
				"data-[style=solid]:bg-primary-900 data-[style=solid]:text-white-900 data-[style=solid]:border data-[style=solid]:border-primary-800 data-[style=solid]:hover:bg-primary-800 data-[style=sold]:hover:bg-ghost-element-hover",
				"data-[style=glassmorphic]:shadow-glassmorphic data-[style=glassmorphic]:relative data-[style=glassmorphic]:bg-linear-[135deg] data-[style=glassmorphic]:from-glassmorphic-bg-gradient-from data-[style=glassmorphic]:via-glassmorphic-bg-gradient-via data-[style=glassmorphic]:to-glassmorphic-bg-gradient-to data-[style=glassmorphic]:backdrop-blur-md",
				"data-[style=glassmorphic]:after:absolute data-[style=glassmorphic]:after:bg-linear-to-r  data-[style=glassmorphic]:after:from-transparentl  data-[style=glassmorphic]:after:via-glassmorphic-highlight/60 data-[style=glassmorphic]:after:left-4 data-[style=glassmorphic]:after:right-4 data-[style=glassmorphic]:after:h-px data-[style=glassmorphic]:after:top-0",
				"data-[style=glassmorphic]:border data-[style=glassmorphic]:border-glassmorphic-border/20",
				"cursor-pointer transition-colors",
				className,
			)}
			data-style={style}
			{...props}
		>
			{style === "glassmorphic" && (
				<>
					{/* <div data-glassmorphic-button-background className=" absolute inset-0 rounded-[2px] backdrop-blur-md"/> */}
					{/* <div className="bg-linear-[135deg] from-glassmorphic-bg-gradient-from via-glassmorphic-bg-gradient-via to-glassmorphic-bg-gradient-to absolute inset-0 rounded-[2px] backdrop-blur-md" /> */}
					{/* Top reflection */}
					<div className="bg-linear-to-r from-transparent via-glassmorphic-highlight/60 to-transparent absolute top-0 left-4 right-4 h-px" />

					{/* Subtle border */}
					<div className="absolute inset-0 rounded-[2px] border border-glassmorphic-border/20" />

					{/* Hover overlay */}
					{/* <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-top from-transparent to-glassmorphic-highlight/10" /> */}
				</>
			)}
			{leftIcon && <div className="*:size-[13px] *:text-text">{leftIcon}</div>}
			<div className="text-[13px] text-text">{children}</div>
			{rightIcon && <div className="*:size-[13px]">{rightIcon}</div>}
		</button>
	);
}
