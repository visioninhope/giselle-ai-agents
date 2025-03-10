"use client";

import clsx from "clsx";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { ChevronDownIcon, PlayIcon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import { EditableText } from "../editor/properties-panel/ui";
import { GiselleLogo } from "../icons";

export function Header({
	action,
}: {
	action?: ReactNode;
}) {
	const { data, updateName } = useWorkflowDesigner();
	return (
		<div className="h-[54px] pl-[24px] pr-[16px] flex items-center justify-between shrink-0">
			<div className="flex items-center gap-[8px] text-white-950">
				<GiselleLogo className="fill-white-900 w-[70px] h-auto mt-[6px]" />
				<Divider />
				<div className="flex gap-[2px] group">
					<EditableText
						fallbackValue="Untitled"
						onChange={updateName}
						value={data.name}
					/>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<button
								type="button"
								className="group-hover:bg-white-900/10 hover:bg-white-900/20 rounded-r-[4px] peer-data-[editing=true]:hidden px-[2px]"
							>
								<ChevronDownIcon className="size-[12px] text-white-900" />
							</button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Portal>
							<DropdownMenu.Content
								align="start"
								className={clsx(
									"relative rounded py-[8px] min-w-[200px]",
									"rounded-[8px] border-[1px] bg-black-900/50 backdrop-blur-[8px]",
									"shadow-[-2px_-1px_0px_0px_rgba(0,0,0,0.1),1px_1px_8px_0px_rgba(0,0,0,0.25)]",
								)}
								onCloseAutoFocus={(e) => {
									e.preventDefault();
								}}
							>
								<div
									className={clsx(
										"absolute z-0 rounded-[8px] inset-0 border-[1px] mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
										"from-[hsl(232,_36%,_72%)]/40 to-[hsl(218,_58%,_21%)]/90",
									)}
								/>
								<div className="relative flex flex-col gap-[8px]">
									<DropdownMenu.RadioGroup className="flex flex-col gap-[8px] px-[8px]">
										<DropdownMenu.RadioItem
											className="p-[8px] rounded-[8px] text-white-900 hover:bg-primary-900/50 transition-colors cursor-pointer text-[12px] outline-none select-none"
											value="settings"
										>
											Settings
										</DropdownMenu.RadioItem>
									</DropdownMenu.RadioGroup>
								</div>
							</DropdownMenu.Content>
						</DropdownMenu.Portal>
					</DropdownMenu.Root>
				</div>
			</div>
			{action && <div className="flex items-center">{action}</div>}
		</div>
	);
}

function Divider() {
	return <div className="text-[24px] font-[250]">/</div>;
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
				"bg-primary-900 text-[14px] text-white-900",
				"cursor-pointer",
			)}
		>
			<PlayIcon className="size-[16px] fill-white-900" />
			<p>Run</p>
		</button>
	);
}
