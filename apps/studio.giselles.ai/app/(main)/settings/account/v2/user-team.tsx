"use client";

import { fetchUserTeams } from "@/services/teams/fetch-user-teams";
import { Search } from "lucide-react";
import { useState } from "react";

export default async function UserTeam() {
	const allTeams = await fetchUserTeams();
	const [teamName, setTeamName] = useState();

	return (
		<>
			<div className="flex items-center gap-x-[11px] py-2 px-3 border-[0.5px] border-black-820/50 rounded-[8px] bg-black-350/20">
				<Search className="size-6 text-black-400" />
				<input
					type="text"
					placeholder="Search for a team..."
					className="w-full text-white-900 font-medium text-[14px] leading-[23.8px] font-geist placeholder:text-black-400"
				/>
			</div>
			<div className="border-[0.5px] border-black-400 rounded-[8px] divide-y divide-black-400">
				{allTeams.map((team) => (
					<UserTeamItem key={team.id} teamName={team.name} />
				))}
			</div>
		</>
	);
}

function UserTeamItem({ teamName }: { teamName: string }) {
	return (
		<div className="flex items-center justify-between gap-4 p-4 bg-black-400/10">
			<div className="flex flex-col">
				<div className="text-white-400 font-medium text-[16px] leading-[22.4px] font-geist">
					{teamName}
				</div>
				<div className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
					Admin
				</div>
			</div>
		</div>
	);
}
