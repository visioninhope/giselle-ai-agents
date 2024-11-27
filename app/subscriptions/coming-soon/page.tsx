import { Card } from "@/components/ui/card";

export default function ComingSoon() {
	return (
		<div className="container mx-auto px-4 py-16">
			<Card className="max-w-2xl mx-auto p-8">
				<h1 className="text-2xl font-bold mb-4">Pro Plan Coming Soon</h1>
				<p className="text-gray-600 mb-4">
					We are currently preparing a new Pro plan. Please stay tuned.
				</p>
			</Card>
		</div>
	);
}
