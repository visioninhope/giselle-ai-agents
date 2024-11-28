import { Button } from "@/components/ui/button";
import { getTeamMembers } from "./actions";

export async function TeamMembersList() {
	const members = await getTeamMembers();

	return (
		<div className="rounded-md border border-zinc-800">
			<div className="grid grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
				<div>Name</div>
				<div>Email</div>
				<div>Role</div>
				<div>Actions</div>
			</div>
			<div className="divide-y divide-zinc-800">
				{members.map((member) => (
					<div
						key={member.id}
						className="grid grid-cols-4 gap-4 p-4 items-center text-zinc-200"
					>
						<div>{member.name}</div>
						<div className="text-zinc-400">{member.email}</div>
						<div className="text-zinc-400">{member.role}</div>
						<div>
							<Button>Remove</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
