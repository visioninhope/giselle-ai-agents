import {
	type Connection,
	ConnectionId,
	isOperationNode,
	Node,
	NodeId,
	type NodeLike,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
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
import { addWorkspaceIndexItem } from "../utils/workspace-index";
import { getWorkspace } from "../workspaces";
import { actPath, workspaceActPath } from "./object/paths";

function buildLevels(nodes: NodeLike[], connections: Connection[]) {
	const operationNodes = nodes.filter(isOperationNode);
	const operationConnections = connections.filter(
		(conn) =>
			conn.outputNode.type === "operation" &&
			conn.inputNode.type === "operation",
	);

	// Calculate in-degrees for topological sort
	const inDegrees: Record<NodeId, number> = {};
	for (const node of operationNodes) {
		inDegrees[node.id] = 0;
	}

	// Track processed connections to handle duplicates
	const processedEdges = new Set<string>();
	for (const conn of operationConnections) {
		const edgeKey = `${conn.outputNode.id}-${conn.inputNode.id}`;
		if (!processedEdges.has(edgeKey)) {
			processedEdges.add(edgeKey);
			inDegrees[conn.inputNode.id] = (inDegrees[conn.inputNode.id] || 0) + 1;
		}
	}

	// Find nodes by level using topological sort
	const levels: NodeId[][] = [];
	const remainingNodes = new Set(operationNodes.map((n) => n.id));

	while (remainingNodes.size > 0) {
		const currentLevel: NodeId[] = [];

		for (const nodeId of remainingNodes) {
			if (inDegrees[nodeId] === 0) {
				currentLevel.push(nodeId);
			}
		}

		if (currentLevel.length === 0) break; // Prevent infinite loop on cycles

		levels.push(currentLevel);

		// Remove processed nodes and update in-degrees
		for (const nodeId of currentLevel) {
			remainingNodes.delete(nodeId);

			// Decrease in-degree of children
			for (const conn of operationConnections) {
				if (conn.outputNode.id === nodeId) {
					inDegrees[conn.inputNode.id]--;
				}
			}
		}
	}

	return levels;
}

export const CreateActInputs = z.object({
	workspaceId: z.optional(WorkspaceId.schema),
	workspace: z.optional(Workspace),
	startNodeId: NodeId.schema,
	connectionIds: z.array(ConnectionId.schema),
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

	const nodes = workspace.nodes.filter((node) =>
		workspace.connections.some(
			(connection) =>
				connection.inputNode.id === node.id ||
				connection.outputNode.id === node.id,
		),
	);
	const connections = workspace.connections.filter(
		(connection) => args.connectionIds?.includes(connection.id) ?? false,
	);

	const actId = ActId.generate();
	const levels = buildLevels(nodes, connections);

	const generations: CreatedGeneration[] = [];
	const sequences: Sequence[] = [];
	for (const level of levels) {
		const steps: Step[] = [];
		for (const nodeId of level) {
			const node = nodes.find((node) => node.id === nodeId);
			if (node === undefined || !isOperationNode(node)) {
				continue;
			}
			const connectedConnections = connections.filter(
				(connection) => connection.inputNode.id === nodeId,
			);

			// Map through each input to find source nodes, preserving duplicates
			const sourceNodes = node.inputs
				.map((input) => {
					// Find connections for this specific input
					const inputConnections = connectedConnections.filter(
						(connection) => connection.inputId === input.id,
					);
					// For each input connection, find the corresponding source node
					if (inputConnections.length > 0) {
						const sourceNodeId = inputConnections[0].outputNode.id;
						const node = nodes.find((n) => n.id === sourceNodeId);
						const parseResult = Node.safeParse(node);
						if (parseResult.success) {
							return parseResult.data;
						}
						return undefined;
					}
					return undefined;
				})
				.filter((node) => node !== undefined);
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
					operationNode: node,
					sourceNodes,
					connections: connectedConnections,
				},
			};
			generations.push(generation);
			steps.push({
				id: StepId.generate(),
				name: node.name ?? defaultName(node),
				status: "created",
				generationId: generation.id,
				duration: 0,
				usage: {
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
				},
			});
		}
		sequences.push({
			id: SequenceId.generate(),
			status: "created",
			steps,
			duration: {
				wallClock: 0,
				totalTask: 0,
			},
			usage: {
				promptTokens: 0,
				completionTokens: 0,
				totalTokens: 0,
			},
		});
	}

	const act: Act = {
		id: ActId.generate(),
		workspaceId: workspace.id,
		status: "inProgress",
		name: startNode.name ?? defaultName(startNode),
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
