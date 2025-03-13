import clsx from "clsx/lite";
import { Label as LabelPrimitive } from "radix-ui";

export function Label({ className, ...props }: LabelPrimitive.LabelProps) {
	return (
		<LabelPrimitive.Root
			className={clsx("text-black-400 text-[12px]", className)}
			{...props}
		/>
	);
}
