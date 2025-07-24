import { NodeId, Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import { z } from "zod/v4";
import {
	type Act,
	ActId,
	ActIndexObject,
	type Sequence,
	SequenceId,
	type Step,
} from "../../concepts/act";
import {
	type CreatedGeneration,
	GenerationContextInput,
	GenerationOrigin,
} from "../../concepts/generation";
import { GenerationId, StepId } from "../../concepts/identifiers";
import { defaultName } from "../../utils";
import { setGeneration } from "../generations";
import type { GiselleEngineContext } from "../types";
import { buildWorkflowFromNode } from "../utils/workflow/build-workflow-from-node";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { getWorkspace } from "../workspaces";
import { actPath, workspaceActPath } from "./object/paths";

export const CreateActInputs = z.object({
	workspaceId: z.optional(WorkspaceId.schema),
	workspace: z.optional(Workspace),
	startNodeId: NodeId.schema,
	inputs: z.array(GenerationContextInput),
	generationOriginType: z.enum(
		GenerationOrigin.options.map((option) => option.shape.type.value),
	),
});
export type CreateActInputs = z.infer<typeof CreateActInputs>;

export async function createAct(
	args: CreateActInputs & { context: GiselleEngineContext },
) {
	let workspace: Workspace | undefined = args.workspace;

	if (args.workspaceId !== undefined) {
		workspace = await getWorkspace({
			...args,
			workspaceId: args.workspaceId,
			useExperimentalStorage: true,
		});
	}
	if (workspace === undefined) {
		throw new Error("workspace or workspaceId is required");
	}
	const startNode = workspace.nodes.find(
		(node) => node.id === args.startNodeId,
	);
	if (startNode === undefined) {
		throw new Error(`Node with id ${args.startNodeId} not found`);
	}

	const flow = buildWorkflowFromNode(startNode, workspace);

	const actId = ActId.generate();
	const generations: CreatedGeneration[] = [];
	const sequences: Sequence[] = [];
	for (const sequence of flow.sequences) {
		const steps: Step[] = [];
		for (const step of sequence.steps) {
			const generation: CreatedGeneration = {
				id: GenerationId.generate(),
				status: "created",
				createdAt: Date.now(),
				context: {
					origin: {
						type: args.generationOriginType,
						workspaceId: workspace.id,
						actId,
					},
					inputs: args.inputs,
					operationNode: step.node,
					sourceNodes: step.sourceNodes,
					connections: step.connections,
				},
			};
			generations.push(generation);
			steps.push({
				id: StepId.generate(),
				name: step.node.name ?? defaultName(step.node),
				status: "created",
				generationId: generation.id,
			});
		}
		sequences.push({
			id: SequenceId.generate(),
			status: "created",
			steps,
		});
	}

	const act: Act = {
		id: ActId.generate(),
		workspaceId: workspace.id,
		status: "inProgress",
		steps: {
			queued: generations.length,
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
		sequences,
	};
	await Promise.all([
		args.context.storage.setItem(actPath(act.id), act),
		addWorkspaceIndexItem({
			storage: args.context.storage,
			indexPath: workspaceActPath(workspace.id),
			item: act,
			itemSchema: ActIndexObject,
		}),
		...generations.map((generation) =>
			setGeneration({
				context: args.context,
				generation,
				useExperimentalStorage: true,
			}),
		),
	]);
	return { act, generations };
}
