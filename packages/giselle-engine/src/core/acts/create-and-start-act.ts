import {
	type FlowTriggerId,
	RunId,
	type Workflow,
} from "@giselle-sdk/data-type";
import { buildWorkflowFromTrigger } from "../flows/build-workflow-from-trigger";
import type { GenerationContextInput } from "../generations";
import type { GiselleEngineContext } from "../types";
import { createAct } from "./create-act";
import { ActIndexObject } from "./object";
import { actPath, workspaceActPath } from "./object/paths";
import { type ActFlowCallbacks, startAct } from "./start-act";

/** @todo telemetry */
export async function createAndStartAct(args: {
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
	const act = await createAct({
		context: args.context,
		trigger: trigger.configuration.provider,
		workspaceId: trigger.workspaceId,
		jobsCount: workflow.sequences.length,
	});
	await Promise.all([
		args.context.storage.setItem(actPath(act.id), act),
		args.context.storage.setItem(
			workspaceActPath(trigger.workspaceId),
			ActIndexObject.parse(act),
		),
	]);

	await startAct({
		flow: workflow,
		context: args.context,
		actId: act.id,
		runId,
		workspaceId: trigger.workspaceId,
		triggerInputs: args.triggerInputs,
		callbacks: args.callbacks,
		useExperimentalStorage: args.useExperimentalStorage,
	});
}
