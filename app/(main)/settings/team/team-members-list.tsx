import { getTeamMembers } from "./actions";
import { TeamMemberListItem } from "./team-members-list-item";

export async function TeamMembersList() {
	const result = await getTeamMembers();

	if (!result.success || !result.data) {
		return (
			<div className="text-sm text-destructive">
				Failed to load team members
			</div>
		);
	}

	const members = result.data;

	return (
		<div className="font-avenir rounded-[16px]">
			<div className="grid grid-cols-[1fr_1fr_200px] gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
				<div>Display name</div>
				<div>Email</div>
				<div>Role</div>
			</div>
			<div className="divide-y divide-zinc-800">
				{members.map((member) => (
					<TeamMemberListItem
						key={member.userId}
						displayName={member.displayName}
						email={member.email}
						role={member.role}
					/>
				))}
			</div>
		</div>
	);
}
