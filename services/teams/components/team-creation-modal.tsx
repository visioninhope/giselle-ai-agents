import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getUser } from "@/lib/supabase";
import { isEmailFromRoute06 } from "@/lib/utils";
import { formatStripePrice, stripe } from "@/services/external/stripe";
import Link from "next/link";
import invariant from "tiny-invariant";
import { fetchUserTeams } from "../fetch-user-teams";
import { TeamCreationForm } from "./team-creation-form";

export default async function TeamCreationModal() {
	const user = await getUser();
	if (!user) {
		throw new Error("User not found");
	}
	const isInternalUser = user.email != null && isEmailFromRoute06(user.email);
	const teams = await fetchUserTeams();
	const hasExistingFreeTeam = teams.some(
		(team) => team.type === "customer" && !team.activeSubscriptionId,
	);
	const proPlanPriceId = process.env.STRIPE_PRO_PLAN_PRICE_ID;
	invariant(proPlanPriceId, "STRIPE_PRO_PLAN_PRICE_ID is not set");
	const proPlan = await stripe.prices.retrieve(proPlanPriceId);
	const proPlanPrice = formatStripePrice(proPlan);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Link
					href="#"
					className="flex items-center text-sm text-blue-500 hover:text-blue-400"
				>
					+ Create New Team
				</Link>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] bg-gray-950 text-gray-100">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-gray-100">
						Create New Team
					</DialogTitle>
				</DialogHeader>
				<TeamCreationForm
					canCreateFreeTeam={!isInternalUser && !hasExistingFreeTeam}
					proPlanPrice={proPlanPrice}
				/>
			</DialogContent>
		</Dialog>
	);
}
