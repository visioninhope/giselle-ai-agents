import type { Port } from "./nodes";

export type AgentId = `agnt_${string}`;
export type BuildId = `bld_${string}`;

export type Agent = {
	id: AgentId;
	buildId: BuildId;
	name: string | null;
	args: Port[];
};
