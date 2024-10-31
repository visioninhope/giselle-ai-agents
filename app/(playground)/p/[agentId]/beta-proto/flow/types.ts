import type { ConnectorObject } from "../connector/types";
import type { GiselleNode, GiselleNodeId } from "../giselle-node/types";
import type { AgentId } from "../types";

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
	actionLayers: FlowActionLayer[];
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

export type FlowActionLayerId = `flw.stk_${string}`;
export const flowActionLayerStatuses = {
	queued: "queued",
	running: "running",
	completed: "completed",
	failed: "failed",
} as const;
type FlowActionLayerType =
	(typeof flowActionLayerStatuses)[keyof typeof flowActionLayerStatuses];
interface BaseFlowActionLayer {
	object: "flow.actionLayer";
	id: FlowActionLayerId;
	actions: FlowAction[];
}
interface QueuedFlowActionLayer extends BaseFlowActionLayer {
	status: Extract<FlowActionLayerType, "queued">;
}
interface RunningFlowActionLayer extends BaseFlowActionLayer {
	status: Extract<FlowActionLayerType, "running">;
}
export type FlowActionLayer = QueuedFlowActionLayer | RunningFlowActionLayer;

export type FlowActionId = `flw.act_${string}`;
export const flowActionStatuses = {
	queued: "queued",
	running: "running",
	completed: "completed",
} as const;

export type FlowActionStatus =
	(typeof flowActionStatuses)[keyof typeof flowActionStatuses];

interface BaseFlowAction {
	id: FlowActionId;
	object: "flow.action";
	nodeId: GiselleNodeId;
}
interface QueuedFlowAction extends BaseFlowAction {
	status: Extract<FlowActionStatus, "queued">;
}
interface RunningFlowAction extends BaseFlowAction {
	status: Extract<FlowActionStatus, "running">;
	output: string;
}
interface CompletedFlowAction extends BaseFlowAction {
	status: Extract<FlowActionStatus, "completed">;
	output: string;
}

export type FlowAction =
	| QueuedFlowAction
	| RunningFlowAction
	| CompletedFlowAction;

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
