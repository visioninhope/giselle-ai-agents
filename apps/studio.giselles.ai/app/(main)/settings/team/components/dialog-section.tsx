"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export function DialogSection({
	className,
	children,
}: React.PropsWithChildren<{ className?: string }>) {
	return (
		<div className={cn("bg-inverse/5 rounded-lg p-4", className)}>
			{children}
		</div>
	);
}
