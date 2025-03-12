import clsx from "clsx/lite";
import { Check, ChevronDown } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export function SelectValue({
	className,
	...props
}: SelectPrimitive.SelectValueProps) {
	return <SelectPrimitive.Value className={className} {...props} />;
}
export function SelectTrigger({
	className,
	children,
	...props
}: SelectPrimitive.SelectTriggerProps) {
	return (
		<SelectPrimitive.Trigger
			className={clsx(
				"flex h-[28px] w-full items-center justify-between whitespace-nowrap rounded-[8px] text-white-800 bg-black-750 border-[1px] border-white-950/10 px-[12px] text-[12px] data-placeholder:text-white-400/70 focus:outline-none focus:ring-1 focus:ring-white-900 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
				"data-[state=open]:rounded-b-[0px] data-[state=open]:border-b-0",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDown className="h-4 w-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export function SelectScrollUpButton(
	props: SelectPrimitive.SelectScrollUpButtonProps,
) {
	return <SelectPrimitive.ScrollUpButton {...props} />;
}
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export function SelectScrollDownButton(
	props: SelectPrimitive.SelectScrollDownButtonProps,
) {
	return <SelectPrimitive.ScrollDownButton {...props} />;
}
SelectScrollDownButton.displayName =
	SelectPrimitive.ScrollDownButton.displayName;

export function SelectContent({
	position = "item-aligned",
	className,
	children,
	...props
}: SelectPrimitive.SelectContentProps) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={clsx(
					"relative z-50 max-h-96 overflow-hidden rounded-[8px]",
					"bg-black-750 text-white-900 border-[1px] border-white-950/10",
					position === "popper" &&
						"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				sideOffset={props.sideOffset}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={clsx(
						"p-1",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}
SelectContent.displayName = SelectPrimitive.Content.displayName;

export function SelectLabel({
	className,
	...props
}: SelectPrimitive.SelectLabelProps) {
	return (
		<SelectPrimitive.Label
			className={clsx("pl-8 pr-2", className)}
			{...props}
		/>
	);
}
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.SelectItemProps) {
	return (
		<SelectPrimitive.Item
			className={clsx(
				"relative flex w-full cursor-default select-none items-center rounded-[4px] h-[24px] px-[12px] text-[12px] outline-none focus:bg-primary-950/50 focus:text-white-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>
					<Check className="h-4 w-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}
SelectItem.displayName = SelectPrimitive.Item.displayName;

export function SelectItemIndicator(
	props: SelectPrimitive.SelectItemIndicatorProps,
) {
	return <SelectPrimitive.ItemIndicator {...props} />;
}
SelectItemIndicator.displayName = SelectPrimitive.ItemIndicator.displayName;

export function SelectSeparator(props: SelectPrimitive.SelectSeparatorProps) {
	return <SelectPrimitive.Separator {...props} />;
}
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
