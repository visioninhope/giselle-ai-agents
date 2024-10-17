import { Card } from "../components/card";
import { redirectToPaymentPortal } from "./actions";

export default function BillingPage() {
	return (
		<div className="grid gap-[16px]">
			<h3
				className="text-[32px] text-black--30 font-rosart"
				style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
			>
				Billing
			</h3>
			<Card
				title="Manage billing"
				description="Manage your subscription and view payment history in our secure Payment Portal, powered by Stripe"
				action={{
					content: "Access Payment Portal",
					onAction: async () => {
						"use server";
						await redirectToPaymentPortal();
					},
				}}
			/>
		</div>
	);
}
