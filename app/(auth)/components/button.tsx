"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
	"w-full flex items-center px-[20px] py-[8px] bg-transparent rounded-[8px] border shadow-sm text-[18px] font-medium font-[Rosart] font-normal leading-[21.6px] ",
	{
		variants: {
			variant: {
				submit:
					"justify-center text-white bg-black-70 border-black-70 gap-[8px] hover:bg-black-30 hover:text-black-80",
				link: "flex-start gap-[40px] text-white bg-transparent border-gray-700 hover:bg-black-30 hover:text-black-80",
			},
		},
	},
);
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
