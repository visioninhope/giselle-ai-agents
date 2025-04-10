"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProTag } from "@/components/pro-tag";
import { FreeTag } from "@/components/free-tag";
import { useRef } from "react";
import { selectTeam } from "../actions/select-team";
import type { Team } from "../types";

type TeamSelectionFormProps = {
	allTeams: Team[];
	currentTeam: Team;
};

export function TeamSelectionForm({
	allTeams,
	currentTeam,
}: TeamSelectionFormProps) {
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<form action={selectTeam} ref={formRef}>
			<Select
				name="teamId"
				defaultValue={currentTeam.id}
				onValueChange={() => {
					formRef.current?.requestSubmit();
				}}
			>
				<SelectTrigger className="w-auto min-w-[180px] max-w-[360px]">
					<SelectValue placeholder="Select Team" />
				</SelectTrigger>
				<SelectContent>
					{allTeams.map((team) => (
						<SelectItem key={team.id} value={team.id}>
							<div className="flex items-center gap-1 pr-4">
								<span className="truncate mr-1" title={team.name}>
									{team.name}
								</span>
								{team.isPro ? <ProTag /> : <FreeTag />}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</form>
	);
}
