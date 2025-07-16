"use client";

import { Button } from "@giselle-internal/ui/button";
import { Select } from "@giselle-internal/ui/select";
import type { FlowTriggerId } from "@giselle-sdk/data-type";
import type { InferSelectModel } from "drizzle-orm";
import { useState } from "react";
import type { teams } from "@/drizzle";

type TeamId = InferSelectModel<typeof teams>["id"];
export interface TeamOption {
	id: TeamId;
	label: string;
}

export interface FlowTriggerUIItem {
	id: FlowTriggerId;
	teamId: TeamId;
	label: string;
}

interface FlowSelectProps {
	teamOptions: TeamOption[];
	flowTriggers: FlowTriggerUIItem[];
}

export function FlowSelect({ teamOptions, flowTriggers }: FlowSelectProps) {
	const [selectedTeamId, setSelectedTeamId] = useState<TeamId | undefined>();

	const filteredFlowTriggers = flowTriggers.filter(
		(flowTrigger) => flowTrigger.teamId === selectedTeamId,
	);

	return (
		<div className="flex items-center gap-2 justify-center">
			<Select
				id="team"
				placeholder="Select team"
				options={teamOptions}
				renderOption={(o) => o.label}
				widthClassName="w-[150px]"
				onValueChange={(value) => setSelectedTeamId(value as TeamId)}
			/>
			<Select
				id="flow"
				placeholder="Select flow"
				options={
					selectedTeamId === undefined
						? []
						: filteredFlowTriggers.length === 0
							? [
									{
										id: "no-flow",
										label: "No flows available",
									},
								]
							: filteredFlowTriggers.map((flowTrigger) => ({
									id: flowTrigger.id,
									label: flowTrigger.label,
								}))
				}
				renderOption={(o) => o.label}
				widthClassName="w-[120px]"
			/>
		</div>
	);
}
