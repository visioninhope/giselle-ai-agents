import { Card } from "@/app/(main)/settings/components/card";
import { getCurrentUserRole, getTeam } from "./actions";
import { TeamMembersForm } from "./team-members-form";

export async function TeamMembers() {
	const { isProPlan } = await getTeam();
	const { data: teamRole } = await getCurrentUserRole();

	return (
		<Card title="Team members">
			{isProPlan && teamRole === "admin" && <TeamMembersForm />}
		</Card>
	);
}
