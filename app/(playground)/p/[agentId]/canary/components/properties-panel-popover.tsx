"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";

import { CirclePlusIcon } from "../../beta-proto/components/icons/circle-plus";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = () => (
	<PopoverPrimitive.Trigger>
		<CirclePlusIcon className="stroke-black-100 fill-black-30" />
	</PopoverPrimitive.Trigger>
);

const PopoverAnchor = PopoverPrimitive.Anchor;

function PopoverContent() {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				side={"top"}
				align="end"
				className="rounded-[16px] p-[8px] text-[14px] w-[200px] text-black-30 bg-black-100 border border-[hsla(222,21%,40%,1)] shadow-[0px_0px_2px_0px_hsla(0,_0%,_100%,_0.1)_inset] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
				sideOffset={5}
			/>
		</PopoverPrimitive.Portal>
	);
}
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
