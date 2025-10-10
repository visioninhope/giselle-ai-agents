import clsx from "clsx/lite";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
	activeIndex?: number;
	underlineVariant?: "default" | "inverse";
}

export function Tabs({
	className,
	children,
	activeIndex = 0,
	underlineVariant = "default",
	...props
}: TabsProps) {
	return (
		<div
			role="tablist"
			data-underline-variant={underlineVariant}
			className={clsx("relative flex items-center gap-2", className)}
			{...props}
		>
			{children}
			{/* underline indicator as simple absolutely-positioned element; consumer positions as needed */}
			<div
				data-active-index={activeIndex}
				className={clsx(
					"absolute bottom-0 left-0 h-px w-full",
					"border-b border-border",
					"data-[underline-variant=inverse]:border-border",
				)}
			/>
		</div>
	);
}

export default Tabs;
