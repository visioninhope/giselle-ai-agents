import {
	ConnectionId,
	type InputId,
	type Node,
	type NodeBase,
	NodeId,
	type NodeLike,
	type NodeReference,
	NodeUIState,
	type OutputId,
	type Viewport,
	type Workspace,
	generateInitialWorkspace,
} from "@giselle-sdk/data-type";
import { isSupportedConnection } from "./is-supported-connection";

interface AddNodeOptions {
	ui?: NodeUIState;
}

export type WorkflowDesigner = ReturnType<typeof WorkflowDesigner>;

export function WorkflowDesigner({
	defaultValue = generateInitialWorkspace(),
}: {
	defaultValue?: Workspace;
}) {
	let nodes = defaultValue.nodes;
	let connections = defaultValue.connections;
	const ui = defaultValue.ui;
	let name = defaultValue.name;
	function addNode(node: Node, options?: AddNodeOptions) {
		nodes = [...nodes, node];
		if (options?.ui) {
			ui.nodeState[node.id] = options.ui;
		}
	}
	function getData() {
		return {
			id: defaultValue.id,
			nodes,
			connections,
			name,
			ui,
			schemaVersion: "20250221",
		} satisfies Workspace;
	}
	function updateNodeData<T extends NodeBase>(node: T, data: Partial<T>) {
		nodes = nodes.map((n) => (n.id !== node.id ? n : { ...n, ...data }));
	}
	function addConnection({
		outputId,
		outputNode,
		inputId,
		inputNode,
	}: {
		outputNode: NodeLike;
		outputId: OutputId;
		inputNode: NodeLike;
		inputId: InputId;
	}) {
		connections = [
			...connections,
			{
				id: ConnectionId.generate(),
				outputNode: {
					id: outputNode.id,
					type: outputNode.type,
					content: { type: outputNode.content.type },
				} as NodeReference,
				outputId,
				inputNode: {
					id: inputNode.id,
					type: inputNode.type,
					content: { type: inputNode.content.type },
				} as NodeReference,
				inputId,
			},
		];
	}
	function setUiNodeState(
		unsafeNodeId: string | NodeId,
		newUiState: Partial<NodeUIState>,
	): void {
		const inputNodeId = NodeId.parse(unsafeNodeId);
		const nodeState = ui.nodeState[inputNodeId];
		ui.nodeState[inputNodeId] = NodeUIState.parse({
			...nodeState,
			...newUiState,
		});
	}
	function setUiViewport(viewport: Viewport) {
		ui.viewport = viewport;
	}
	function deleteConnection(connectionId: ConnectionId) {
		connections = connections.filter(
			(connection) => connection.id !== connectionId,
		);
	}
	function deleteNode(unsafeNodeId: string | NodeId) {
		const deleteNodeId = NodeId.parse(unsafeNodeId);
		const deleteNode = nodes.find((node) => node.id === deleteNodeId);
		delete ui.nodeState[deleteNodeId];
		nodes = nodes.filter((node) => node.id !== deleteNodeId);
		return deleteNode;
	}
	function updateName(newName: string | undefined) {
		name = newName;
	}

	return {
		addNode,
		addConnection,
		getData,
		updateNodeData,
		setUiNodeState,
		setUiViewport,
		deleteNode,
		deleteConnection,
		updateName,
		isSupportedConnection,
	};
}
