import clsx from "clsx/lite";

type AuthButtonVariant = "filled" | "link";

interface AuthButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: AuthButtonVariant;
}

export function AuthButton({
	className,
	variant = "filled",
	children,
	...props
}: AuthButtonProps) {
	return (
		<button
			className={clsx(
				"w-full font-medium rounded-[12px] py-[8px] px-[20px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/60 border",
				variant === "filled" &&
					"bg-[#c4dcf8] text-black-950 border-transparent hover:bg-transparent hover:text-primary-100 hover:border-glass-border/20",
				variant === "link" && "bg-transparent text-text hover:underline",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}
