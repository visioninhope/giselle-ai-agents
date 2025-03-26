import clsx from "clsx/lite";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

type TooltipProps = Omit<
	ComponentProps<typeof TooltipPrimitive.Trigger>,
	"asChild"
> & {
	children: ReactNode;
	text: ReactNode;
	sideOffset?: number;
	delayDuration?: number;
};

export function Tooltip({
	text,
	sideOffset = 8,
	delayDuration = 300,
	...props
}: TooltipProps) {
	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root delayDuration={delayDuration}>
				<TooltipPrimitive.Trigger asChild {...props} />
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						sideOffset={sideOffset}
						className={clsx(
							"z-50 overflow-hidden rounded-[4px] px-[8px] py-[4px]",
							"bg-[#97A2BE]",
							"text-[12px] text-black-850",
							"[&_code]:text-black-400",
							"border border-[hsla(232,36%,72%,0.2)]",
							"shadow-[0px_2px_4px_rgba(0,0,0,0.1)]",
						)}
					>
						{text}
						<TooltipPrimitive.Arrow 
							className={clsx(
								"fill-[#97A2BE]",
								"border-[hsla(232,36%,72%,0.2)]",
							)}
							width={12}
							height={6}
						/>
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
}
