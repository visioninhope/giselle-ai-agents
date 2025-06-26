import clsx from "clsx/lite";

export function PopoverContent(props: React.PropsWithChildren) {
	return (
		<div
			className={clsx(
				"rounded-[8px] bg-(image:--glass-bg) z-50",
				"p-[4px] border border-glass-border/20 backdrop-blur-md shadow-xl",
				"after:absolute after:bg-(image:--glass-highlight-bg) after:left-4 after:right-4 after:h-px after:top-0",
			)}
			{...props}
		/>
	);
}
