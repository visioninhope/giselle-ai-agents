import clsx from "clsx/lite";
import { AppIcon } from "./app-icon";

export function AppThumbnail({
	className,
	children,
}: React.PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={clsx(
				"aspect-video w-full rounded-lg bg-inverse/5 flex items-center justify-center",
				className,
			)}
		>
			{children ?? <AppIcon />}
		</div>
	);
}
