import clsx from "clsx/lite";
import { Switch } from "radix-ui";

export function Toggle({
	name,
	checked,
	onCheckedChange,
	children,
}: React.PropsWithChildren<{
	name: string;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}>) {
	return (
		<div className="flex items-center">
			{children}
			<Switch.Root
				className={clsx(
					"h-[15px] w-[27px] rounded-full outline-none",
					"border border-border-muted data-[state=checked]:border-primary-900",
					"bg-transparent data-[state=checked]:bg-primary-900",
				)}
				id={name}
				checked={checked}
				onCheckedChange={onCheckedChange}
			>
				<Switch.Thumb
					className={clsx(
						"block size-[11px] translate-x-[2px] rounded-full",
						"bg-inverse data-[state=checked]:bg-inverse",
						"transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[13px]",
					)}
				/>
			</Switch.Root>
		</div>
	);
}
