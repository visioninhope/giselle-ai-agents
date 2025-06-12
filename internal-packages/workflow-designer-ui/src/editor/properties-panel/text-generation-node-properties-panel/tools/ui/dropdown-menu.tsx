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
						"p-[4px] border border-border-variant shadow-md",
						"**:data-item:text-text **:data-item:outline-none **:data-item:cursor-pointer **:data-item:hover:bg-ghost-element-hover",
						"**:data-item:rounded-[2px] **:data-item:px-[8px] **:data-item:py-[4px] **:data-item:text-[14px]",
					)}
				>
					{items.map((item) => (
						<DropdownMenuPrimitive.Item data-item key={item.id}>
							{renderItem(item)}
						</DropdownMenuPrimitive.Item>
					))}
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	);
}
