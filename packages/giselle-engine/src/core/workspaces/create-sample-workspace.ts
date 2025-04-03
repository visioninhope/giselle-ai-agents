import {
	type Connection,
	ConnectionId,
	type Input,
	InputId,
	type Node,
	NodeId,
	type NodeUIState,
	type Output,
	OutputId,
	type UIState,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import { buildWorkflowMap } from "@giselle-sdk/workflow-utils";
import type { GiselleEngineContext } from "../types";
import templateJson from "./sample.json";
import { setWorkspace } from "./utils";

export async function createSampleWorkspace(args: {
	context: GiselleEngineContext;
}) {
	const templateWorkspace = Workspace.parse(templateJson);
	const idMap = new Map<string, string>();
	const newNodes: Node[] = [];
	for (const templateNode of templateWorkspace.nodes) {
		const newInputs: Input[] = [];
		const newOutputs: Output[] = [];
		for (const templateInput of templateNode.inputs) {
			const newId = InputId.generate();
			newInputs.push({
				...templateInput,
				id: newId,
			});
			idMap.set(templateInput.id, newId);
		}
		for (const templateOutput of templateNode.outputs) {
			const newId = OutputId.generate();
			newOutputs.push({
				...templateOutput,
				id: newId,
			});
			idMap.set(templateOutput.id, newId);
		}
		const newNodeId = NodeId.generate();
		newNodes.push({
			...templateNode,
			id: newNodeId,
			inputs: newInputs,
			outputs: newOutputs,
		});
		idMap.set(templateNode.id, newNodeId);
	}
	const newConnections: Connection[] = [];
	for (const templateConnection of templateWorkspace.connections) {
		const newInputId = idMap.get(templateConnection.inputId);
		const newOutputId = idMap.get(templateConnection.outputId);
		const newInputNodeId = idMap.get(templateConnection.inputNode.id);
		const newOutputNodeId = idMap.get(templateConnection.outputNode.id);
		if (
			newInputId === undefined ||
			newOutputId === undefined ||
			newInputNodeId === undefined ||
			newOutputNodeId === undefined
		) {
			throw new Error(`Invalid connection: ${templateConnection.id}`);
		}
		const newConnectionId = ConnectionId.generate();
		newConnections.push({
			id: newConnectionId,
			inputId: InputId.parse(newInputId),
			outputId: OutputId.parse(newOutputId),
			inputNode: {
				...templateConnection.inputNode,
				id: NodeId.parse(newInputNodeId),
			},
			outputNode: {
				...templateConnection.outputNode,
				id: NodeId.parse(newOutputNodeId),
			},
		});
	}

	const newNodeState: Record<NodeId, NodeUIState> = {};
	for (const [nodeId, nodeState] of Object.entries(
		templateWorkspace.ui.nodeState,
	)) {
		if (nodeState === undefined) {
			continue;
		}
		const newNodeId = idMap.get(nodeId);
		if (newNodeId === undefined) {
			continue;
		}
		newNodeState[NodeId.parse(newNodeId)] = nodeState;
	}
	const newUi: UIState = {
		...templateWorkspace.ui,
		nodeState: newNodeState,
	};
	const workflows = Array.from(
		buildWorkflowMap(
			new Map(newNodes.map((node) => [node.id, node])),
			new Map(newConnections.map((connection) => [connection.id, connection])),
		).values(),
	);
	const newWorkspaceId = WorkspaceId.generate();
	const newWorkspace = {
		id: newWorkspaceId,
		schemaVersion: templateWorkspace.schemaVersion,
		nodes: newNodes,
		connections: newConnections,
		editingWorkflows: workflows,
		ui: newUi,
	} satisfies Workspace;
	await setWorkspace({
		storage: args.context.storage,
		workspaceId: newWorkspaceId,
		workspace: newWorkspace,
	});
	return newWorkspace;
}
