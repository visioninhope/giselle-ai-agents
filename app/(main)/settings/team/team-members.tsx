import { Card } from "@/app/(main)/settings/components/card";
import { TeamMembersForm } from "./team-members-form";
import { TeamMembersList } from "./team-members-list";

export async function TeamMembers() {
	return (
		<Card title="Team members">
			<TeamMembersForm />
			<TeamMembersList />
		</Card>
	);
}
