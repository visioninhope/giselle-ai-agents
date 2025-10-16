import clsx from "clsx/lite";
import { Popover as PopoverPrimitive } from "radix-ui";
import { GlassSurfaceLayers } from "./glass-surface";

export function PopoverContent(props: React.PropsWithChildren) {
	return (
		<div
			className={clsx("relative rounded-[8px] p-[4px] shadow-xl")}
			{...props}
		>
			<GlassSurfaceLayers
				radiusClass="rounded-[8px]"
				borderStyle="solid"
				withTopHighlight={true}
				withBaseFill={true}
			/>
			{props.children}
		</div>
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
