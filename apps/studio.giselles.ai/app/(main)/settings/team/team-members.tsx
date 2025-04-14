import { fetchCurrentTeam, isProPlan } from "@/services/teams";
import { Card } from "../components/card";
import { getCurrentUserRole, getTeamMembers } from "./actions";
import { InviteMemberDialog } from "./invite-member-dialog";
import { TeamMembersList } from "./team-members-list";

export async function TeamMembers() {
	const team = await fetchCurrentTeam();
	const { success: hasMembers, data: members } = await getTeamMembers();
	const { success: hasCurrentUserRole, data: currentUserRole } =
		await getCurrentUserRole();

	if (!hasMembers || !members) {
		return (
			<Card title="Member List">
				<div className="text-error-900 text-[12px] leading-[20.4px] tracking-normal font-geist">
					Failed to load team members
				</div>
			</Card>
		);
	}

	if (!hasCurrentUserRole || !currentUserRole) {
		return (
			<Card title="Member List">
				<div className="text-error-900 text-[12px] leading-[20.4px] tracking-normal font-geist">
					Failed to get current user role
				</div>
			</Card>
		);
	}

	const hasProPlan = isProPlan(team);

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-[28px] font-hubot font-medium text-primary-100 drop-shadow-[0_0_20px_#0087f6]">
					Members
				</h1>
				{hasProPlan && currentUserRole === "admin" && <InviteMemberDialog />}
			</div>
			<Card title="Member List">
				<TeamMembersList
					teamId={team.id}
					isProPlan={hasProPlan}
					members={members}
					currentUserRole={currentUserRole}
				/>
			</Card>
		</div>
	);
}
