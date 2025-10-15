import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx/lite";

type AuthButtonVariant = "filled" | "link";

interface AuthButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: AuthButtonVariant;
	asChild?: boolean;
}

export function AuthButton({
	className,
	variant = "filled",
	asChild = false,
	children,
	...props
}: AuthButtonProps) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			className={clsx(
				"w-full font-medium rounded-[12px] py-[8px] px-[20px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/60 border flex items-center justify-center text-center",
				variant === "filled" &&
					"bg-blue-pale text-auth-dark border-transparent hover:bg-auth-dark hover:text-blue-pale hover:border-auth-dark",
				variant === "link" && "bg-transparent text-text hover:underline",
				className,
			)}
			{...props}
		>
			{children}
		</Comp>
	);
}
