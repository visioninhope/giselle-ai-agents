import { getAccountInfo } from "@/app/(main)/settings/account/actions";
import { getUser } from "@/lib/supabase";
import Avatar from "boring-avatars";
import { fetchCurrentTeam, fetchUserTeams } from "../";
import { isProPlan } from "../utils";
import TeamCreation from "./team-creation";
import { TeamSelectionForm } from "./team-selection-form";

export async function TeamSelection() {
	const allTeams = await fetchUserTeams();
	const currentTeam = await fetchCurrentTeam();
	const user = await getUser();
	const { displayName } = await getAccountInfo();

	const formattedAllTeams = allTeams.map((team) => ({
		id: team.id,
		name: team.name,
		isPro: isProPlan(team),
	}));

	const formattedCurrentTeam = {
		id: currentTeam.id,
		name: currentTeam.name,
		isPro: isProPlan(currentTeam),
	};

	return (
		<TeamSelectionForm
			allTeams={formattedAllTeams}
			currentTeam={formattedCurrentTeam}
			key={currentTeam.id}
			currentUser={
				<>
					<Avatar
						name={user.email}
						variant="marble"
						size={24}
						colors={["#413e4a", "#73626e", "#b38184", "#f0b49e", "#f7e4be"]}
					/>
					<span className="text-white-400 font-medium text-[14px] leading-[20.4px] font-hubot">
						{displayName}
					</span>
				</>
			}
			teamCreation={
				<TeamCreation>
					<span className="text-white-400 font-medium text-[14px] leading-[20.4px] font-hubot">
						Create team
					</span>
				</TeamCreation>
			}
		/>
	);
}
