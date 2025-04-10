import { fetchCurrentTeam, fetchUserTeams } from "../";
import { TeamSelectionForm } from "./team-selection-form";

export async function TeamSelection() {
	const _allTeams = await fetchUserTeams();
	const _currentTeam = await fetchCurrentTeam();

	const allTeams = _allTeams.map(({ id, name }) => ({
		id,
		name,
		isPro: id.startsWith("tm_pro_"),
	}));

	const currentTeam = {
		id: _currentTeam.id,
		name: _currentTeam.name,
		isPro: _currentTeam.id.startsWith("tm_pro_"),
	};

	return (
		<TeamSelectionForm
			allTeams={allTeams}
			currentTeam={currentTeam}
			key={currentTeam.id}
		/>
	);
}
