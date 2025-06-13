import clsx from "clsx/lite";
import { ChevronDownIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { Button } from "./button";

type Identifiable = {
	id: string;
};
interface DropdownMenuProps<T extends Identifiable> {
	items: Array<T>;
	renderItem: (item: T) => React.ReactNode;
	placeholder: string;
}
export function DropdownMenu<T extends Identifiable>({
	renderItem,
	items,
	placeholder,
}: DropdownMenuProps<T>) {
	return (
		<DropdownMenuPrimitive.Root>
			<DropdownMenuPrimitive.Trigger asChild>
				<Button
					type="button"
					variant="filled"
					rightIcon={<ChevronDownIcon className="size-[13px]" />}
				>
					{placeholder}
				</Button>
			</DropdownMenuPrimitive.Trigger>
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					sideOffset={4}
					className={clsx(
						"rounded-[2px] w-(--radix-dropdown-menu-trigger-width) bg-panel-background z-50",
						"p-[4px] border border-border-variant",
						"shadow-[1px_1px_0px_rgba(0,0,0,0.05),-1px_1px_0px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.30)]",
					)}
				>
					{items.map((item) => (
						<DropdownMenuPrimitive.Item
							data-item
							key={item.id}
							className={clsx(
								"text-text outline-none cursor-pointer hover:bg-ghost-element-hover",
								"rounded-[2px] px-[8px] py-[2px] text-[14px]",
							)}
						>
							{renderItem(item)}
						</DropdownMenuPrimitive.Item>
					))}
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	);
}
