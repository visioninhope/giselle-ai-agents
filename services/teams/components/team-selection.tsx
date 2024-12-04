import { fetchCurrentTeam } from "../fetch-current-team";
import { fetchUserTeams } from "../fetch-user-teams";
import TeamCreationModal from "./team-creation-modal";
import { TeamSelectionForm } from "./team-selection-form";

export async function TeamSelection() {
	const allTeams = await fetchUserTeams();
	const currentTeam = await fetchCurrentTeam();

	return (
		<TeamSelectionForm
			allTeams={allTeams}
			currentTeam={currentTeam}
			teamCreationModal={<TeamCreationModal />}
		/>
	);
}
