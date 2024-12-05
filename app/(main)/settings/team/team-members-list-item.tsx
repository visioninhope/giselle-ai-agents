import type { TeamRole } from "@/drizzle";

type TeamMemberListItemProps = {
	displayName: string | null;
	email: string | null;
	role: TeamRole;
};

export function TeamMemberListItem({
	displayName,
	email,
	role,
}: TeamMemberListItemProps) {
	return (
		<div className="grid grid-cols-[1fr_1fr_200px] gap-4 p-4 items-center text-zinc-200">
			<div className="text-zinc-400">{displayName || "No display name"}</div>
			<div className="text-zinc-400">{email || "No email"}</div>
			<div className="text-zinc-400 capitalize">{role}</div>
		</div>
	);
}
