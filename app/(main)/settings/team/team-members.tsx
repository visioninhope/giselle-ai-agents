import { Card } from "@/app/(main)/settings/components/card";
import { TeamMembersForm } from "./team-members-form";

export async function TeamMembers() {
	return (
		<Card title="Team members">
			<TeamMembersForm />
		</Card>
	);
}
