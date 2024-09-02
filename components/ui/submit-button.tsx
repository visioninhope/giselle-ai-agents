"use client";

import type { FC, ReactNode, Ref } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

type SubmitButtonProps = ButtonProps & {
	ref?: Ref<HTMLButtonElement>;
	pendingNode?: ReactNode;
};
export const SubmitButton: FC<SubmitButtonProps> = ({
	type,
	pendingNode,
	children,
	...props
}) => {
	const { pending } = useFormStatus();
	console.log(pending);
	if (pending) {
		return (
			<Button disabled {...props}>
				{pendingNode || children}
			</Button>
		);
	}

	return (
		<Button type="submit" {...props}>
			{children}
		</Button>
	);
};
