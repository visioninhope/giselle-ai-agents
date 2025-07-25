"use client";

import { AgentCard } from "./agent-card";
import { LightTrackingOverlay } from "./light-overlay";
import type { AgentGridProps } from "./types";
import { useLightTracking } from "./use-light-tracking";

export const AgentGrid = ({ agents }: AgentGridProps) => {
	const { rootRef, fadeRef, handleMove, handleLeave } = useLightTracking();

	return (
		<div
			ref={rootRef}
			onPointerMove={handleMove}
			onPointerLeave={handleLeave}
			className="relative flex h-full w-full flex-wrap items-start justify-start gap-4"
			style={
				{
					"--r": "400px",
					"--x": "50%",
					"--y": "50%",
				} as React.CSSProperties
			}
		>
			{agents.map((agent) => (
				<AgentCard key={agent.id} agent={agent} />
			))}
			<LightTrackingOverlay fadeRef={fadeRef} />
		</div>
	);
};
