import { updateGiselleSession } from "@/lib/giselle-session";
import { fetchUserTeams } from "./";
import type { TeamId } from "./types";

export async function setCurrentTeam(teamId: TeamId) {
	const teams = await fetchUserTeams();
	let team = teams.find((t) => t.id === teamId);
	if (team == null) {
		// fallback to the first team
		team = teams[0];
	}
	await updateGiselleSession({ teamId: team.id });
}
