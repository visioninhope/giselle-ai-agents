"use client";

import clsx from "clsx/lite";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type React from "react";
import { PopoverContent } from "./popover";

interface Identifiable {
	id: string | number;
}

interface DropdownMenuProps<T extends Identifiable> {
	items: Array<T>;
	trigger: React.ReactNode;
	renderItem: (item: T) => React.ReactNode;
	onSelect?: (option: T) => void;
	widthClassName?: string;
	sideOffset?: DropdownMenuPrimitive.DropdownMenuContentProps["sideOffset"];
	align?: DropdownMenuPrimitive.DropdownMenuContentProps["align"];
}

export function DropdownMenu<T extends Identifiable>({
	trigger,
	items,
	renderItem: renderOption,
	onSelect,
	widthClassName,
	sideOffset,
	align,
}: DropdownMenuProps<T>) {
	return (
		<DropdownMenuPrimitive.Root>
			<DropdownMenuPrimitive.Trigger asChild>
				{trigger}
			</DropdownMenuPrimitive.Trigger>
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					sideOffset={sideOffset}
					align={align}
					className={clsx("z-50", widthClassName)}
				>
					<PopoverContent>
						{items.map((option) => (
							<DropdownMenuPrimitive.Item
								key={option.id}
								onSelect={() => onSelect?.(option)}
								className={clsx(
									"text-text outline-none cursor-pointer hover:bg-ghost-element-hover",
									"rounded-[4px] px-[8px] py-[6px] text-[14px]",
									"flex items-center justify-between gap-[4px]",
								)}
							>
								{renderOption(option)}
							</DropdownMenuPrimitive.Item>
						))}
					</PopoverContent>
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	);
}
