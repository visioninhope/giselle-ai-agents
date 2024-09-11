"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const linkTextVariants = cva(
	"text-black-30 leading-[23.8px] underline hover:text-black--70",
	{
		variants: {
			variant: {},
		},
	},
);
export interface LinkTextProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof linkTextVariants> {
	asChild?: boolean;
}

const LinkText = forwardRef<HTMLAnchorElement, LinkTextProps>(
	({ className, variant, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "a";
		return (
			<Comp
				className={cn(linkTextVariants({ variant, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
LinkText.displayName = "LinkText";

export { LinkText, linkTextVariants };
