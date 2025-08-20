"use client";

import { AgentCard } from "./agent-card";
import type { AgentGridProps } from "./types";

export const AgentGrid = ({ agents }: AgentGridProps) => {
	// const { rootRef, fadeRef, handleMove, handleLeave } = useLightTracking();

	return (
		<div className="relative flex h-full w-full flex-wrap items-start justify-start gap-4">
			{agents.map((agent) => (
				<AgentCard key={agent.id} agent={agent} />
			))}
		</div>
	);
};
