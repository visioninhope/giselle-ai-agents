import type {
	FlowTrigger,
	FlowTriggerId,
	Workflow,
	Workspace,
} from "@giselle-sdk/data-type";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import type { GiselleEngineContext } from "../types";
import { getWorkspace } from "../workspaces/utils";
import { getFlowTrigger } from "./utils";

export async function buildWorkflowFromTrigger(args: {
	triggerId: FlowTriggerId;
	context: GiselleEngineContext;
	useExperimentalStorage: boolean;
}): Promise<{
	workflow: Workflow;
	trigger: FlowTrigger;
	workspace: Workspace;
} | null> {
	const trigger = await getFlowTrigger({
		storage: args.context.storage,
		flowTriggerId: args.triggerId,
	});
	if (trigger === undefined || !trigger.enable) {
		return null;
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
		return null;
	}

	const workflow = buildWorkflowFromNode(triggerNode, workspace);
	if (workflow === null) {
		return null;
	}

	return {
		workflow,
		trigger,
		workspace,
	};
}
