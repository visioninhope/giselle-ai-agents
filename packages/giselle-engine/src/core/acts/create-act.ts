import {
	type NodeId,
	SequenceId,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import type { GiselleEngineContext } from "../types";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { getWorkspace } from "../workspaces";
import { type Act, ActId, ActIndexObject, StepId } from "./object";
import { actPath, workspaceActPath } from "./object/paths";

export async function createAct(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
	startNodeId: NodeId;
	useExperimentalStorage: boolean;
}) {
	const workspace = await getWorkspace(args);
	const startNode = workspace.nodes.find(
		(node) => node.id === args.startNodeId,
	);
	if (startNode === undefined) {
		throw new Error(`Node with id ${args.startNodeId} not found`);
	}

	const flow = buildWorkflowFromNode(startNode, workspace);
	const allSteps = flow.sequences.reduce(
		(acc, sequence) => acc + sequence.steps.length,
		0,
	);

	const act: Act = {
		id: ActId.generate(),
		workspaceId: args.workspaceId,
		status: "inProgress",
		steps: {
			queued: allSteps,
			inProgress: 0,
			warning: 0,
			completed: 0,
			failed: 0,
			cancelled: 0,
		},
		trigger: "testing",
		duration: {
			wallClock: 0,
			totalTask: 0,
		},
		usage: {
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
		},
		createdAt: Date.now(),
		updatedAt: Date.now(),
		annotations: [],
		sequences: flow.sequences.map((sequence) => ({
			id: SequenceId.generate(),
			status: "pending",
			steps: sequence.steps.map((step) => ({
				id: StepId.generate(),
				status: "pending",
			})),
		})),
	};
	await Promise.all([
		args.context.storage.setItem(actPath(act.id), act),
		addWorkspaceIndexItem({
			storage: args.context.storage,
			indexPath: workspaceActPath(args.workspaceId),
			item: act,
			itemSchema: ActIndexObject,
		}),
	]);
	return act;
}
