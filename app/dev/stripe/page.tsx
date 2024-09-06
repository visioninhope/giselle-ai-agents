import { CheckoutButton } from "@/services/external/stripe/components/checkout-button";

export default function StripeDevPage() {
	return (
		<div>
			<h1>Stripe Dev Page</h1>
			<CheckoutButton />
		</div>
	);
}
