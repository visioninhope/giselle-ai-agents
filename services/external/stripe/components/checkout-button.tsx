"use client";

import { Button } from "@/components/ui/button";
import type { FC } from "react";
import { useFormState } from "react-dom";
import { createAndRedirectCheckoutSession } from "../actions/checkout";

export const CheckoutButton: FC = () => {
	const [_, action, isPending] = useFormState(
		() => createAndRedirectCheckoutSession(),
		null,
	);
	return (
		<form action={action}>
			{isPending ? (
				<Button className="opacity-50">Loadig...</Button>
			) : (
				<Button>Click me</Button>
			)}
		</form>
	);
};
