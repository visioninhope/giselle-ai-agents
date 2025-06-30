import clsx from "clsx/lite";
import { Popover as PopoverPrimitive } from "radix-ui";

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

export function Popover({
	trigger,
	children,
}: React.PropsWithChildren<{
	trigger: React.ReactNode;
}>) {
	return (
		<PopoverPrimitive.Root>
			<PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content asChild>
					<PopoverContent>{children}</PopoverContent>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}
