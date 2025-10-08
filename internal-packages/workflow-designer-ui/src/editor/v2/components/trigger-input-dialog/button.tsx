import { clsx } from "clsx/lite";
import { LoaderIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
	leftIcon: LeftIcon,
	rightIcon: RightIcon,
	loading = false,
	disabled = false,
	children,
	...props
}: {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	loading?: boolean;
	disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">) {
	const isDisabled = loading || disabled;

	return (
		<button
			type="button"
			className={clsx(
				"bg-bg-900 px-[8px] rounded-[4px] py-[4px] text-[14px] flex items-center gap-[4px] outline-none text-black-900",
				"data-[loading=true]:cursor-not-allowed data-[loading=true]:opacity-60",
				"data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60",
				"data-[loading=false]:data-[disabled=false]:cursor-pointer",
			)}
			data-loading={loading}
			data-disabled={isDisabled}
			disabled={isDisabled}
			{...props}
		>
			{loading ? <LoaderIcon className="size-[14px] animate-spin" /> : LeftIcon}
			<div>{children}</div>
			{!loading && RightIcon}
		</button>
	);
}
