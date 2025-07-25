import clsx from "clsx/lite";
import { CheckIcon, DotIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
export const DropdownMenu = DropdownMenuPrimitive.Root;

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const _DropdownMenuGroup = DropdownMenuPrimitive.Group;

const _DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({
	align,
	sideOffset,
	children,
	onEscapeKeyDown,
	onCloseAutoFocus,
	onPointerDownOutside,
	onFocusOutside,
}: Pick<
	ComponentProps<typeof DropdownMenuPrimitive.Content>,
	| "children"
	| "align"
	| "sideOffset"
	| "onEscapeKeyDown"
	| "onCloseAutoFocus"
	| "onPointerDownOutside"
	| "onFocusOutside"
>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				sideOffset={sideOffset}
				align={align}
				className={clsx(
					"z-50 min-w-[8rem] overflow-hidden rounded-[8px] border border-white-900 bg-black-900 text-black-300 shadow-[0px_0px_2px_0px_hsla(0,_0%,_100%,_0.1)_inset]",
				)}
				onEscapeKeyDown={onEscapeKeyDown}
				onCloseAutoFocus={onCloseAutoFocus}
				onPointerDownOutside={onPointerDownOutside}
				onFocusOutside={onFocusOutside}
			>
				{children}
			</DropdownMenuPrimitive.Content>
		</DropdownMenuPrimitive.Portal>
	);
}
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

function DropdownMenuCheckboxItem({
	children,
	...props
}: Omit<
	ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
	"className"
>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			className="relative flex cursor-default select-none items-center  py-[8px] pl-2 pr-8 text-sm outline-none transition-colors focus:bg-white-900/20 focus:text-white-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			{...props}
		>
			{children}
			<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="h-4 w-4" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
		</DropdownMenuPrimitive.CheckboxItem>
	);
}
DropdownMenuCheckboxItem.displayName =
	DropdownMenuPrimitive.CheckboxItem.displayName;

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
	return (
		<DropdownMenuPrimitive.Label className="px-[16px] py-[8px] text-[10px] text-black-400">
			{children}
		</DropdownMenuPrimitive.Label>
	);
}
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

export function DropdownMenuSeparator() {
	return (
		<DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-muted" />
	);
}
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export function DropdownMenuRadioItem({
	children,
	value,
}: {
	children: ReactNode;
	value: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>["value"];
}) {
	return (
		<DropdownMenuPrimitive.RadioItem
			className="relative flex cursor-default select-none items-center py-[8px] pl-2 pr-8 text-sm outline-none transition-colors focus:bg-white-900/20 focus:text-white-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			value={value}
		>
			<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<DotIcon className="h-8 w-8 fill-current" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
}
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

function DropdownMenuItem({
	children,
	...props
}: Omit<ComponentProps<typeof DropdownMenuPrimitive.Item>, "className">) {
	return (
		<DropdownMenuPrimitive.Item
			className="relative flex cursor-default select-none items-center py-[8px] pl-2 pr-8 text-sm outline-none transition-colors focus:bg-white-900/20 focus:text-white-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			{...props}
		>
			{children}
		</DropdownMenuPrimitive.Item>
	);
}
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
