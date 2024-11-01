import type { Artifact } from "../artifact/types";
import type { ConnectorObject } from "../connector/types";
import type { GiselleNodeArchetype } from "../giselle-node/blueprints";
import type { GiselleNode, GiselleNodeId } from "../giselle-node/types";
import type { AgentId } from "../types";
import type { WebSearch } from "../web-search/types";

export type FlowId = `flw_${string}`;

export const flowStatuses = {
	initializing: "initializing",
	queued: "queued",
	running: "running",
} as const;

type FlowStatus = (typeof flowStatuses)[keyof typeof flowStatuses];

interface BaseFlow {
	agentId: AgentId;
	object: "flow";
	id: FlowId;
	finalNodeId: GiselleNodeId;
	graph: {
		nodes: GiselleNode[];
		connectors: ConnectorObject[];
	};
	jobs: Job[];
	artifacts: Artifact[];
	webSearches: WebSearch[];
}

export interface InitializingFlow extends BaseFlow {
	status: Extract<FlowStatus, "initializing">;
}
export interface QueuedFlow extends BaseFlow {
	status: Extract<FlowStatus, "queued">;
	dataUrl: string;
}

export interface RunningFlow extends BaseFlow {
	status: Extract<FlowStatus, "running">;
	dataUrl: string;
}

export type Flow = InitializingFlow | QueuedFlow | RunningFlow;

export type JobId = `jb_${string}`;
export const jobStatuses = {
	queued: "queued",
	running: "running",
	completed: "completed",
	failed: "failed",
} as const;
type JobStatus = (typeof jobStatuses)[keyof typeof jobStatuses];
interface BaseJob {
	object: "job";
	id: JobId;
	steps: Step[];
}
interface QueuedJob extends BaseJob {
	status: Extract<JobStatus, "queued">;
}
interface RunningJob extends BaseJob {
	status: Extract<JobStatus, "running">;
}
export type Job = QueuedJob | RunningJob;

export type StepId = `stp_${string}`;
export const stepStatuses = {
	queued: "queued",
	running: "running",
	streaming: "streaming",
	completed: "completed",
} as const;

export type StepStatus = (typeof stepStatuses)[keyof typeof stepStatuses];

type StepAction = GiselleNodeArchetype;
interface BaseStep {
	id: StepId;
	object: "step";
	nodeId: GiselleNodeId;
	action: StepAction;
	prompt: string;
}
interface QueuedStep extends BaseStep {
	status: Extract<StepStatus, "queued">;
}
interface RunningStep extends BaseStep {
	status: Extract<StepStatus, "running">;
}
interface StreamingStep extends BaseStep {
	status: Extract<StepStatus, "streaming">;
	output: unknown;
}
interface CompletedStep extends BaseStep {
	status: Extract<StepStatus, "completed">;
	output: unknown;
}

export type Step = QueuedStep | RunningStep | StreamingStep | CompletedStep;

interface BaseFlowIndex {
	object: "flow.index";
	id: FlowId;
}
export interface InitializingFlowIndex extends BaseFlowIndex {
	status: Extract<FlowStatus, "initializing">;
}
export interface QueuedFlowIndex extends BaseFlowIndex {
	status: Extract<FlowStatus, "queued">;
}
export interface RunningFlowIndex extends BaseFlowIndex {
	status: Extract<FlowStatus, "running">;
	dataUrl: string;
}
export type FlowIndex =
	| InitializingFlowIndex
	| QueuedFlowIndex
	| RunningFlowIndex;
