import clsx from "clsx/lite";
import { Slot } from "radix-ui";

interface InverseSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
	asChild?: boolean;
	withBorder?: boolean;
}

export function InverseSurface({
	className,
	asChild = false,
	withBorder = true,
	...props
}: InverseSurfaceProps) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			className={clsx(
				// thin surface background with optional border
				"bg-surface",
				withBorder && "border border-border",
				"rounded-sm",
				className,
			)}
			{...props}
		/>
	);
}
