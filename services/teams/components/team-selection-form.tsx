"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type ReactNode, useRef } from "react";
import { selectTeam } from "../actions/select-team";

type Team = {
	dbId: number;
	name: string;
};

type TeamSelectionFormProps = {
	allTeams: Team[];
	currentTeam: Team;
	children: ReactNode;
};

export function TeamSelectionForm({
	allTeams,
	currentTeam,
	children,
}: TeamSelectionFormProps) {
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<form action={selectTeam} ref={formRef}>
			<Select
				name="team"
				defaultValue={currentTeam.dbId.toString()}
				onValueChange={() => {
					formRef.current?.requestSubmit();
				}}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder="Select Team" />
				</SelectTrigger>
				<SelectContent>
					{allTeams.map((team) => (
						<SelectItem key={team.dbId} value={team.dbId.toString()}>
							{team.name}
						</SelectItem>
					))}
					<div className="px-2 py-2 border-t border-black-80">{children}</div>
				</SelectContent>
			</Select>
		</form>
	);
}
