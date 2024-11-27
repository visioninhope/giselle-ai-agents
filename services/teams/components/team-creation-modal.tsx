import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	db,
	subscriptions,
	supabaseUserMappings,
	teamMemberships,
	teams,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { TeamCreationForm } from "./team-creation-form";

async function fetchTeams() {
	const user = await getUser();
	const result = await db
		.select({
			teamDbId: teams.dbId,
			teamName: teams.name,
			teamIsInternal: teams.isInternalTeam,
			activeSubscription: subscriptions.id,
		})
		.from(teams)
		.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.leftJoin(
			subscriptions,
			and(
				eq(subscriptions.teamDbId, subscriptions.teamDbId),
				eq(subscriptions.status, "active"),
			),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));
	return result;
}

export default async function TeamCreationModal() {
	const teams = await fetchTeams();
	const hasExistingFreeTeam = teams.some(
		(team) => !team.activeSubscription && !team.teamIsInternal,
	);

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
				<TeamCreationForm hasExistingFreeTeam={hasExistingFreeTeam} />
			</DialogContent>
		</Dialog>
	);
}
