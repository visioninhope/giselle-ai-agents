import { Card as SettingsCard } from "@/app/(main)/settings/components/card";
import { Suspense } from "react";
import { TeamMembersForm } from "./team-members-form";
import { TeamMembersList } from "./team-members-list";

export async function TeamMembers() {
	return (
		<SettingsCard title="Team members">
			<TeamMembersForm />
			<TeamMembersList />
		</SettingsCard>
	);
}
