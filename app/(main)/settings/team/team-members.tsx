import { Card } from "@/app/(main)/settings/components/card";
import { getCurrentUserRole } from "./actions";
import { TeamMembersForm } from "./team-members-form";

export async function TeamMembers() {
	const { data: teamRole } = await getCurrentUserRole();

	return (
		<Card title="Team members">
			{teamRole === "admin" && <TeamMembersForm />}
		</Card>
	);
}
