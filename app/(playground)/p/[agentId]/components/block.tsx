import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import clsx from "clsx/lite";
import type { ComponentProps, ReactNode } from "react";

function HoverCardContent({
	className,
	align = "center",
	sideOffset = 4,
	side = "left",
	...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
	return (
		<HoverCardPrimitive.Content
			align={align}
			side={side}
			sideOffset={sideOffset}
			className="z-50 w-64 rounded-[16px] border border-black-70 bg-black-100 p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
			{...props}
		/>
	);
}
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

type BlockSize = "default" | "large";
export function Block({
	children,
	className,
	size = "default",
	hoverContent,
	...props
}: {
	children: ReactNode;
	size?: BlockSize;
	className?: string;
	hoverContent?: ReactNode;
}) {
	const blockContent = (
		<div
			data-size={size}
			className={clsx(
				"rounded-[4px] relative bg-[hsla(202,52%,46%,0.1)] text-left group",
				"data-[size=default]:px-[12px] data-[size=default]:py-[8px]",
				"data-[size=large]:px-[16px] data-[size=large]:py-[8px]",
			)}
			{...props}
		>
			<div className={clsx("z-10 relative", className)}>{children}</div>
			<div className="absolute z-0 rounded-[4px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent to-[hsla(233,4%,37%,1)] from-[hsla(233,62%,22%,1)]" />
		</div>
	);

	if (!hoverContent) {
		return blockContent;
	}
	return (
		<HoverCardPrimitive.Root>
			<HoverCardPrimitive.Trigger asChild>
				{blockContent}
			</HoverCardPrimitive.Trigger>
			<HoverCardContent>{hoverContent}</HoverCardContent>
		</HoverCardPrimitive.Root>
	);
}
