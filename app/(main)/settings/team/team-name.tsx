import { getTeamName } from "./actions";
import { TeamNameForm } from "./team-name-form";

export async function TeamName() {
	const teamName = await getTeamName();

	return <TeamNameForm name={teamName} />;
}
