import type { AgentId } from "@/services/agents";

export type Agent = {
	id: AgentId;
	name: string | null;
	updatedAt: Date;
	workspaceId: string | null;
};

export type AgentGridProps = {
	agents: Agent[];
};

export type AgentCardProps = {
	agent: Agent;
};

export type Position = {
	x: number;
	y: number;
};

export type LightTrackingConfig = {
	radius: number;
	fadeInDuration: number;
	fadeOutDuration: number;
	trackingDuration: number;
};
