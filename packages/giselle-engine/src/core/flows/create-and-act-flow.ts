import {
	type FlowTriggerId,
	type GenerationContextInput,
	RunId,
	type Workflow,
} from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { FlowRunIndexObject } from "./act/object";
import { flowRunPath, workspaceFlowRunPath } from "./act/paths";
import { type ActFlowCallbacks, actFlow } from "./act-flow";
import { buildWorkflowFromTrigger } from "./build-workflow-from-trigger";
import { createAct } from "./create-act";

/** @todo telemetry */
export async function createAndActFlow(args: {
	triggerId: FlowTriggerId;
	context: GiselleEngineContext;
	triggerInputs?: GenerationContextInput[];
	callbacks?: {
		flowCreate?: (args: { flow: Workflow }) => void | Promise<void>;
	} & ActFlowCallbacks;
	useExperimentalStorage: boolean;
}) {
	const result = await buildWorkflowFromTrigger({
		triggerId: args.triggerId,
		context: args.context,
		useExperimentalStorage: args.useExperimentalStorage,
	});
	if (result === null) {
		return;
	}

	const { workflow, trigger } = result;

	await args.callbacks?.flowCreate?.({ flow: workflow });

	const runId = RunId.generate();
	const flowRun = await createAct({
		context: args.context,
		trigger: trigger.configuration.provider,
		workspaceId: trigger.workspaceId,
		jobsCount: workflow.sequences.length,
	});
	await Promise.all([
		args.context.storage.setItem(flowRunPath(flowRun.id), flowRun),
		args.context.storage.setItem(
			workspaceFlowRunPath(trigger.workspaceId),
			FlowRunIndexObject.parse(flowRun),
		),
	]);

	await actFlow({
		flow: workflow,
		context: args.context,
		flowRunId: flowRun.id,
		runId,
		workspaceId: trigger.workspaceId,
		triggerInputs: args.triggerInputs,
		callbacks: args.callbacks,
		useExperimentalStorage: args.useExperimentalStorage,
	});
}
