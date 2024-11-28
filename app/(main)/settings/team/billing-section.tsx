import { Button } from "@/components/ui/button";
import { Card } from "../components/card";

export default function BillingSection() {
	return (
		<Card title="Billing">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-zinc-400">Current Plan</p>
					<p className="text-xl font-semibold text-zinc-200">Pro Plan</p>
				</div>
				<Button className="w-fit">Manage Billing</Button>
			</div>
		</Card>
	);
}
