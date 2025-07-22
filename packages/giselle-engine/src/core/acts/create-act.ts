import { NodeId, WorkspaceId } from "@giselle-sdk/data-type";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import { z } from "zod/v4";
import { setGeneration } from "../generations";
import {
	type CreatedGeneration,
	GenerationId,
	type ParameterItem,
} from "../generations/object";
import type { GiselleEngineContext } from "../types";
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { getWorkspace } from "../workspaces";
import {
	type Act,
	ActId,
	ActIndexObject,
	type Sequence,
	SequenceId,
	type Step,
	StepId,
} from "./object";
import { actPath, workspaceActPath } from "./object/paths";

export const FormInput = z.object({
	name: z.string(),
	label: z.string(),
	type: z.enum(["text", "multiline-text", "number"]),
	required: z.boolean(),
});

type FormInput = z.infer<typeof FormInput>;

function toParameterItems(
	inputs: FormInput[],
	values: Record<string, string | number>,
): ParameterItem[] {
	const items: ParameterItem[] = [];
	for (const input of inputs) {
		const value = values[input.name];
		if (value === undefined || value === "") {
			continue;
		}
		switch (input.type) {
			case "text":
			case "multiline-text":
				items.push({
					type: "string",
					name: input.name,
					value: value as string,
				});
				break;
			case "number":
				items.push({
					type: "number",
					name: input.name,
					value: value as number,
				});
				break;
			default: {
				const _exhaustiveCheck: never = input.type;
				throw new Error(`Unhandled input type: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

export const CreateActInputs = z.object({
	workspaceId: WorkspaceId.schema,
	startNodeId: NodeId.schema,
	useExperimentalStorage: z.boolean(),
	inputs: z.array(FormInput),
	values: z.record(z.string(), z.union([z.string(), z.number()])),
});

export type CreateActInputs = z.infer<typeof CreateActInputs>;

export async function createAct(
	args: CreateActInputs & { context: GiselleEngineContext },
) {
	const workspace = await getWorkspace(args);
	const startNode = workspace.nodes.find(
		(node) => node.id === args.startNodeId,
	);
	if (startNode === undefined) {
		throw new Error(`Node with id ${args.startNodeId} not found`);
	}

	const flow = buildWorkflowFromNode(startNode, workspace);

	const generations: CreatedGeneration[] = [];
	const sequences: Sequence[] = [];
	for (const sequence of flow.sequences) {
		const steps: Step[] = [];
		for (const step of sequence.steps) {
			const parameterItems =
				step.node.content.type === "trigger"
					? toParameterItems(args.inputs, args.values)
					: [];
			const generation: CreatedGeneration = {
				id: GenerationId.generate(),
				status: "created",
				createdAt: Date.now(),
				context: {
					origin: { type: "workspace", id: workspace.id },
					inputs:
						parameterItems.length > 0
							? [{ type: "parameters", items: parameterItems }]
							: [],
					operationNode: step.node,
					sourceNodes: step.sourceNodes,
					connections: step.connections,
				},
			};
			generations.push(generation);
			steps.push({
				id: StepId.generate(),
				status: "pending",
				generationId: generation.id,
			});
		}
		sequences.push({
			id: SequenceId.generate(),
			status: "pending",
			steps,
		});
	}

	const act: Act = {
		id: ActId.generate(),
		workspaceId: args.workspaceId,
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
			indexPath: workspaceActPath(args.workspaceId),
			item: act,
			itemSchema: ActIndexObject,
		}),
		...generations.map((generation) =>
			setGeneration({
				context: args.context,
				generation,
				useExperimentalStorage: args.useExperimentalStorage,
			}),
		),
	]);
	return act;
}
