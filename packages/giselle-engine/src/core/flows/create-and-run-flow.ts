import {
	type FlowTriggerId,
	type GenerationContextInput,
	RunId,
	type Workflow,
} from "@giselle-sdk/data-type";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import type { GiselleEngineContext } from "../types";
import { getWorkspace } from "../workspaces/utils";
import { createRun } from "./create-run";
import { FlowRunIndexObject } from "./run/object";
import { flowRunPath, workspaceFlowRunPath } from "./run/paths";
import { type RunFlowCallbacks, runFlow } from "./run-flow";
import { getFlowTrigger } from "./utils";

/** @todo telemetry */
export async function createAndRunFlow(args: {
	triggerId: FlowTriggerId;
	context: GiselleEngineContext;
	triggerInputs?: GenerationContextInput[];
	callbacks?: {
		flowCreate?: (args: { flow: Workflow }) => void | Promise<void>;
	} & RunFlowCallbacks;
	useExperimentalStorage: boolean;
}) {
	const trigger = await getFlowTrigger({
		storage: args.context.storage,
		flowTriggerId: args.triggerId,
	});
	if (trigger === undefined || !trigger.enable) {
		return;
	}
	const workspace = await getWorkspace({
		storage: args.context.storage,
		experimental_storage: args.context.experimental_storage,
		workspaceId: trigger.workspaceId,
		useExperimentalStorage: args.useExperimentalStorage,
	});

	const triggerNode = workspace.nodes.find(
		(node) => node.id === trigger.nodeId,
	);
	if (triggerNode === undefined) {
		return;
	}

	const flow = buildWorkflowFromNode(triggerNode, workspace);
	if (flow === null) {
		return;
	}

	await args.callbacks?.flowCreate?.({ flow });

	const runId = RunId.generate();
	const flowRun = await createRun({
		context: args.context,
		trigger: trigger.configuration.provider,
		workspaceId: trigger.workspaceId,
		jobsCount: flow.jobs.length,
	});
	await Promise.all([
		args.context.storage.setItem(flowRunPath(flowRun.id), flowRun),
		args.context.storage.setItem(
			workspaceFlowRunPath(trigger.workspaceId),
			FlowRunIndexObject.parse(flowRun),
		),
	]);

	await runFlow({
		flow,
		context: args.context,
		flowRunId: flowRun.id,
		runId,
		workspaceId: trigger.workspaceId,
		triggerInputs: args.triggerInputs,
		callbacks: args.callbacks,
		useExperimentalStorage: args.useExperimentalStorage,
	});
}
