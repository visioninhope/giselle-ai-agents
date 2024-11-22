"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps, FC } from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList: FC<ComponentProps<typeof TabsPrimitive.List>> = ({
	className,
	ref,
	...props
}) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn("gap-[16px] flex items-center", className)}
		{...props}
	/>
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger: FC<ComponentProps<typeof TabsPrimitive.Trigger>> = ({
	ref,
	className,
	...props
}) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"font-rosart text-[16px] text-black-70 data-[state=active]:text-black-30 py-[6px] px-[2px]",
			className,
		)}
		{...props}
	/>
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent: FC<ComponentProps<typeof TabsPrimitive.Content>> = ({
	ref,
	className,
	...props
}) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"px-[24px] pt-[16px] pb-[24px] overflow-y-auto overflow-x-hidden",
			className,
		)}
		{...props}
	/>
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
