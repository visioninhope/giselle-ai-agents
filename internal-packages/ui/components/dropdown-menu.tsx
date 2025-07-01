"use client";

import clsx from "clsx/lite";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type React from "react";
import { PopoverContent } from "./popover";

interface Identifiable {
	id: string | number;
}

interface DropdownMenuProps<
	T extends Identifiable,
	TRenderItemAsChild extends boolean,
> {
	items: Array<T>;
	trigger: React.ReactNode;
	renderItemAsChild?: TRenderItemAsChild;
	renderItem: TRenderItemAsChild extends true
		? (item: T) => React.ReactElement
		: (item: T) => React.ReactNode;
	onSelect?: (event: Event, option: T) => void;
	widthClassName?: string;
	sideOffset?: DropdownMenuPrimitive.DropdownMenuContentProps["sideOffset"];
	align?: DropdownMenuPrimitive.DropdownMenuContentProps["align"];
	open?: DropdownMenuPrimitive.DropdownMenuProps["open"];
	onOpenChange?: DropdownMenuPrimitive.DropdownMenuProps["onOpenChange"];
}

export function DropdownMenu<
	T extends Identifiable,
	TRenderItemAsChild extends boolean = false,
>({
	trigger,
	items,
	renderItem,
	renderItemAsChild,
	onSelect,
	widthClassName,
	sideOffset,
	align,
	open,
	onOpenChange,
}: DropdownMenuProps<T, TRenderItemAsChild>) {
	return (
		<DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DropdownMenuPrimitive.Trigger asChild>
				{trigger}
			</DropdownMenuPrimitive.Trigger>
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					sideOffset={sideOffset}
					align={align}
					className={clsx("z-10", widthClassName)}
				>
					<PopoverContent>
						{items.map((option) => (
							<DropdownMenuPrimitive.Item
								asChild={renderItemAsChild}
								key={option.id}
								onSelect={(event) => onSelect?.(event, option)}
								className={clsx(
									"text-text outline-none cursor-pointer hover:bg-ghost-element-hover",
									"rounded-[4px] px-[8px] py-[6px] text-[14px]",
									"flex items-center justify-between gap-[4px]",
								)}
							>
								{renderItem(option)}
							</DropdownMenuPrimitive.Item>
						))}
					</PopoverContent>
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	);
}
