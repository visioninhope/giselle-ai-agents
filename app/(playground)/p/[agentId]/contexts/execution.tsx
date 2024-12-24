"use client";

import type { StreamableValue } from "ai/rsc";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { deriveFlows } from "../lib/graph";
import {
	type PerformFlowExecutionOptions,
	createExecutionSnapshot,
	performFlowExecution as sharedPerformFlowExecution,
} from "../lib/runner";
import {
	createExecutionId,
	createJobExecutionId,
	createStepExecutionId,
} from "../lib/utils";
import type {
	Artifact,
	Execution,
	ExecutionId,
	ExecutionSnapshot,
	Flow,
	FlowId,
	JobExecution,
	NodeId,
	StepId,
	TextArtifactObject,
} from "../types";
import { useGraph } from "./graph";
import { usePlaygroundMode } from "./playground-mode";
import { usePropertiesPanel } from "./properties-panel";
import { useToast } from "./toast";

export function useExecutionRunner(
	baseOptions?: Pick<
		PerformFlowExecutionOptions,
		"onFinish" | "onExecutionChange" | "onStepFail"
	>,
) {
	const performFlowExecution = useCallback(
		async (options: PerformFlowExecutionOptions) =>
			sharedPerformFlowExecution({ ...baseOptions, ...options }),
		[baseOptions],
	);
	return performFlowExecution;
}

function buildJobExecutionsFromSnapshot(
	executionSnapshot: ExecutionSnapshot,
	forceRetryStepId?: StepId,
): JobExecution[] {
	return executionSnapshot.execution.jobExecutions.map((jobExecution) => {
		const hasForceRetryStep = jobExecution.stepExecutions.some(
			(stepExecution) => stepExecution.stepId === forceRetryStepId,
		);
		if (hasForceRetryStep || jobExecution.status !== "completed") {
			return {
				...jobExecution,
				status: "pending",
				stepExecutions: jobExecution.stepExecutions.map((stepExecution) =>
					stepExecution.stepId === forceRetryStepId ||
					stepExecution.status !== "completed"
						? {
								...stepExecution,
								status: "pending",
							}
						: stepExecution,
				),
			};
		}
		return jobExecution;
	});
}
function buildArtifactsFromSnapshot(
	executionSnapshot: ExecutionSnapshot,
	forceRetryStepId?: StepId,
) {
	const retryStepNodeId = executionSnapshot.flow.jobs
		.flatMap((job) => job.steps)
		.find((step) => step.id === forceRetryStepId)?.nodeId;
	return executionSnapshot.execution.artifacts.filter(
		(artifact) => artifact.creatorNodeId !== retryStepNodeId,
	);
}

// Helper functions for execution state management
const createInitialJobExecutions = (flow: Flow): JobExecution[] => {
	return flow.jobs.map((job) => ({
		id: createJobExecutionId(),
		jobId: job.id,
		status: "pending",
		stepExecutions: job.steps.map((step) => ({
			id: createStepExecutionId(),
			stepId: step.id,
			nodeId: step.nodeId,
			status: "pending",
		})),
	}));
};

interface ExecutionContextType {
	execution: Execution | null;
	executeNode: (nodeId: NodeId) => Promise<void>;
	executeFlow: (flowId: FlowId) => Promise<void>;
	retryFlowExecution: (
		executionId: ExecutionId,
		forceRetryStepId?: StepId,
	) => Promise<void>;
	onFinishPerformExecutionAction: (
		startedAt: number,
		endedAt: number,
		totalDurationMs: number,
	) => Promise<void>;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(
	undefined,
);

type ExecuteStepAction = (
	flowId: FlowId,
	executionId: ExecutionId,
	stepId: StepId,
	artifacts: Artifact[],
) => Promise<StreamableValue<TextArtifactObject, unknown>>;

type RetryStepAction = (
	retryExecutionSnapshotUrl: string,
	executionId: ExecutionId,
	stepId: StepId,
	artifacts: Artifact[],
) => Promise<StreamableValue<TextArtifactObject, unknown>>;
interface ExecutionProviderProps {
	children: ReactNode;
	executeStepAction: ExecuteStepAction;
	putExecutionAction: (
		executionSnapshot: ExecutionSnapshot,
	) => Promise<{ blobUrl: string }>;
	retryStepAction: RetryStepAction;
	executeNodeAction: (
		executionId: ExecutionId,
		nodeId: NodeId,
	) => Promise<StreamableValue<TextArtifactObject, unknown>>;
	onFinishPerformExecutionAction: (
		startedAt: number,
		endedAt: number,
		totalDurationMs: number,
	) => Promise<void>;
}

export function ExecutionProvider({
	children,
	executeStepAction,
	putExecutionAction,
	retryStepAction,
	executeNodeAction,
	onFinishPerformExecutionAction,
}: ExecutionProviderProps) {
	const { dispatch, flush, graph } = useGraph();
	const { setTab } = usePropertiesPanel();
	const { addToast } = useToast();
	const { setPlaygroundMode } = usePlaygroundMode();
	const [execution, setExecution] = useState<Execution | null>(null);
	const performFlowExecution = useExecutionRunner({
		onExecutionChange: setExecution,
		onStepFail: (stepExecution) => {
			addToast({
				type: "error",
				message: stepExecution.error,
			});
		},
		onFinish: async ({ endedAt, durationMs, execution }) => {
			await onFinishPerformExecutionAction(
				endedAt,
				durationMs,
				execution.runStartedAt,
			);
			const flow = graph.flows.find((flow) => flow.id === execution.flowId);
			if (flow !== undefined) {
				const snapshot = createExecutionSnapshot({
					...graph,
					flow,
					execution,
				});
				const { blobUrl } = await putExecutionAction(snapshot);
				dispatch({
					type: "addExecutionIndex",
					input: {
						executionIndex: {
							executionId: execution.id,
							blobUrl,
							completedAt: endedAt,
						},
					},
				});
			}
		},
	});

	const executeFlow = useCallback(
		async (flowId: FlowId) => {
			const flow = graph.flows.find((flow) => flow.id === flowId);
			if (!flow) throw new Error("Flow not found");

			setPlaygroundMode("viewer");
			await flush();
			const executionId = createExecutionId();
			const jobExecutions = createInitialJobExecutions(flow);
			const flowRunStartedAt = Date.now();

			// Initialize flow execution
			const initialExecution: Execution = {
				id: executionId,
				status: "running",
				flowId,
				jobExecutions,
				artifacts: [],
				runStartedAt: flowRunStartedAt,
			};
			setExecution(initialExecution);

			const finalExecution = await performFlowExecution({
				initialExecution,
				executeStepFn: (stepId) =>
					executeStepAction(
						flowId,
						executionId,
						stepId,
						initialExecution.artifacts,
					),
			});
			setExecution(finalExecution);
		},
		[setPlaygroundMode, executeStepAction, flush, graph, performFlowExecution],
	);

	const retryFlowExecution = useCallback(
		async (retryExecutionId: ExecutionId, forceRetryStepId?: StepId) => {
			const executionIndex = graph.executionIndexes.find(
				(executionIndex) => executionIndex.executionId === retryExecutionId,
			);
			if (executionIndex === undefined) {
				throw new Error("Execution not found");
			}
			const retryExecutionSnapshot = (await fetch(executionIndex.blobUrl).then(
				(res) => res.json(),
			)) as unknown as ExecutionSnapshot;

			await flush();
			const flowRunStartedAt = Date.now();
			const initialExecution: Execution = {
				id: createExecutionId(),
				flowId: retryExecutionSnapshot.flow.id,
				jobExecutions: buildJobExecutionsFromSnapshot(
					retryExecutionSnapshot,
					forceRetryStepId,
				),
				artifacts: buildArtifactsFromSnapshot(
					retryExecutionSnapshot,
					forceRetryStepId,
				),
				status: "running",
				runStartedAt: flowRunStartedAt,
			};
			const finalExecution = await performFlowExecution({
				initialExecution,
				executeStepFn: (stepId) =>
					retryStepAction(
						executionIndex.blobUrl,
						initialExecution.id,
						stepId,
						initialExecution.artifacts,
					),
			});
			setExecution(finalExecution);
		},
		[graph.executionIndexes, flush, retryStepAction, performFlowExecution],
	);

	const executeNode = useCallback(
		async (nodeId: NodeId) => {
			setTab("Result");
			const executionId = createExecutionId();
			const flowRunStartedAt = Date.now();
			const node = graph.nodes.find((node) => node.id === nodeId);
			if (node === undefined) {
				throw new Error("Node not found");
			}

			const tmpFlows = deriveFlows({
				nodes: [node],
				connections: [],
				flows: [],
			});
			if (tmpFlows.length !== 1) {
				throw new Error("Unexpected number of flows");
			}
			const tmpFlow = tmpFlows[0];

			// Initialize flow execution
			const initialExecution: Execution = {
				id: executionId,
				status: "running",
				jobExecutions: createInitialJobExecutions(tmpFlow),
				artifacts: [],
				runStartedAt: flowRunStartedAt,
			};
			await performFlowExecution({
				initialExecution,
				executeStepFn: (stepId) => executeNodeAction(executionId, node.id),
				onExecutionChange(execution) {
					const targetArtifact = execution.artifacts.find(
						(artifact) => artifact.creatorNodeId === node.id,
					);
					if (targetArtifact === undefined) {
						return;
					}
					dispatch({
						type: "upsertArtifact",
						input: {
							nodeId,
							artifact: targetArtifact,
						},
					});
				},
				onStepFinish: (_, artifact) => {
					dispatch({
						type: "upsertArtifact",
						input: {
							nodeId,
							artifact,
						},
					});
				},
			});
		},
		[setTab, executeNodeAction, performFlowExecution, graph.nodes, dispatch],
	);

	return (
		<ExecutionContext.Provider
			value={{
				execution,
				executeFlow,
				retryFlowExecution,
				executeNode,
				onFinishPerformExecutionAction,
			}}
		>
			{children}
		</ExecutionContext.Provider>
	);
}

export function useExecution() {
	const context = useContext(ExecutionContext);
	if (!context) {
		throw new Error("useExecution must be used within an ExecutionProvider");
	}
	return context;
}
