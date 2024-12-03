import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { fetchCurrentTeam } from "../fetch-current-team";
import { fetchUserTeams } from "../fetch-user-teams";
import TeamCreationModal from "./team-creation-modal";

export async function TeamSelectionForm() {
	const allTeams = await fetchUserTeams();
	const currentTeam = await fetchCurrentTeam();

	return (
		<Select defaultValue={currentTeam.dbId.toString()}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select Team" />
			</SelectTrigger>
			<SelectContent>
				{allTeams.map((team) => (
					<SelectItem key={team.dbId} value={team.dbId.toString()}>
						{team.name}
					</SelectItem>
				))}
				<div className="px-2 py-2 border-t border-black-80">
					<TeamCreationModal />
				</div>
			</SelectContent>
		</Select>
	);
}
