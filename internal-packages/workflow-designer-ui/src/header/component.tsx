import clsx from "clsx";
import { PlayIcon } from "lucide-react";
import type { ReactNode } from "react";
import { GiselleLogo } from "../icons";

export function Header({
	action,
}: {
	action?: ReactNode;
}) {
	return (
		<div className="h-[54px] pl-[24px] pr-[16px] flex items-center justify-between shrink-0">
			<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
			{action && <div className="flex items-center">{action}</div>}
		</div>
	);
}

export function RunButton({
	onClick,
}: {
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"flex py-[8px] px-[16px] justify-center items-center gap-[4px]",
				"rounded-[8px]",
				"bg-blue text-[14px] text-white",
				"cursor-pointer",
			)}
		>
			<PlayIcon className="size-[16px] fill-white" />
			<p>Run</p>
		</button>
	);
}
