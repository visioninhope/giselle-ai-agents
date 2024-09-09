"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import type { FC } from "react";
import { useFormState } from "react-dom";
import { createCheckout } from "../actions/create-checkout";

export const CheckoutButton: FC = () => {
	const [_, action, isPending] = useFormState(async () => {
		// const checkout = await createCheckout("usr_g6gvph3d8f2daqhhzta8ldyw");
		// redirect(checkout.url as string);
	}, null);
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
