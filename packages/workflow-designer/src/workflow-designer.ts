import {
	type ConnectionHandle,
	type ConnectionId,
	type CreateFileNodeParams,
	type CreateTextGenerationNodeParams,
	type CreateTextNodeParams,
	type FileId,
	type Node,
	type NodeBase,
	NodeId,
	NodeUIState,
	type UploadedFileData,
	type Workspace,
	createConnection,
	createFileNode,
	createTextGenerationNode,
	createTextNode,
	generateInitialWorkspace,
} from "@giselle-sdk/data-type";
import {
	callCreateOpenAiVectorStoreApi,
	callGetLLMProvidersApi,
	callRemoveFileApi,
	callSaveWorkspaceApi,
	callUploadFileApi,
} from "@giselle-sdk/giselle-engine/client";
import { getLLMProviders } from "@giselle-sdk/giselle-engine/schema";
import { buildWorkflowMap } from "@giselle-sdk/workflow-utils";
import type { z } from "zod";

interface AddNodeOptions {
	ui?: NodeUIState;
}

export type WorkflowDesigner = ReturnType<typeof WorkflowDesigner>;

export function WorkflowDesigner({
	defaultValue = generateInitialWorkspace(),
	saveWorkflowApi = "/api/giselle/save-workspace",
	uploadFileApi = "/api/giselle/upload-file",
	removeFileApi = "/api/giselle/remove-file",
	createOpenAiVectorStoreApi = "/api/giselle/create-openai-vector-store",
	getLLMProvidersApi = getLLMProviders.defaultApi,
}: {
	defaultValue?: Workspace;
	saveWorkflowApi?: string;
	uploadFileApi?: string;
	removeFileApi?: string;
	createOpenAiVectorStoreApi?: string;
	getLLMProvidersApi?: string;
	getNodeArtifactsApi?: string;
	getArtifactApi?: string;
}) {
	let nodes = defaultValue.nodes;
	let connections = defaultValue.connections;
	const ui = defaultValue.ui;
	let editingWorkflows = defaultValue.editingWorkflows;
	function updateWorkflowMap() {
		editingWorkflows = Array.from(
			buildWorkflowMap(
				new Map(nodes.map((node) => [node.id, node])),
				new Map(connections.map((connection) => [connection.id, connection])),
			).values(),
		);
	}
	function addTextGenerationNode(
		params: CreateTextGenerationNodeParams,
		options?: AddNodeOptions,
	) {
		const textgenerationNodeData = createTextGenerationNode(params);
		nodes = [...nodes, textgenerationNodeData];
		if (options?.ui) {
			ui.nodeState[textgenerationNodeData.id] = options.ui;
		}
		updateWorkflowMap();
		return textgenerationNodeData;
	}
	function addTextNode(
		params: z.infer<typeof CreateTextNodeParams>,
		options?: AddNodeOptions,
	) {
		const textNodeData = createTextNode(params);
		nodes = [...nodes, textNodeData];
		if (options?.ui) {
			ui.nodeState[textNodeData.id] = options.ui;
		}
		updateWorkflowMap();
	}
	function getData() {
		return {
			id: defaultValue.id,
			nodes,
			connections,
			ui,
			editingWorkflows,
		} satisfies Workspace;
	}
	function updateNodeData<T extends Node>(node: T, data: Partial<T>) {
		nodes = [...nodes.filter((n) => n.id !== node.id), { ...node, ...data }];
		updateWorkflowMap();
	}
	function addConnection(
		sourceNode: NodeBase,
		targetNodeHandle: ConnectionHandle,
	) {
		const connection = createConnection({
			sourceNode,
			targetNodeHandle,
		});
		connections = [...connections, connection];
	}
	function setUiNodeState(
		unsafeNodeId: string | NodeId,
		newUiState: Partial<NodeUIState>,
	): void {
		const targetNodeId = NodeId.parse(unsafeNodeId);
		const nodeState = ui.nodeState[targetNodeId];
		ui.nodeState[targetNodeId] = NodeUIState.parse({
			...nodeState,
			...newUiState,
		});
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
		updateWorkflowMap();
		return deleteNode;
	}
	async function uploadFile(file: File, fileId: FileId) {
		return await callUploadFileApi({
			api: uploadFileApi,
			workspaceId: defaultValue.id,
			file,
			fileId,
			fileName: file.name,
		});
	}
	async function removeFile(uploadedFile: UploadedFileData) {
		await callRemoveFileApi({
			api: removeFileApi,
			workspaceId: defaultValue.id,
			uploadedFile,
		});
	}
	async function saveWorkspace() {
		await callSaveWorkspaceApi({
			api: saveWorkflowApi,
			workspaceId: defaultValue.id,
			workspace: getData(),
		});
	}
	function addFileNode(params: CreateFileNodeParams, options?: AddNodeOptions) {
		const fileNodeData = createFileNode(params);
		nodes = [...nodes, fileNodeData];
		if (options?.ui) {
			ui.nodeState[fileNodeData.id] = options.ui;
		}
		updateWorkflowMap();
		return fileNodeData;
	}
	async function createOpenAiVectorStore() {
		return await callCreateOpenAiVectorStoreApi({
			workspaceId: defaultValue.id,
			api: createOpenAiVectorStoreApi,
		});
	}
	async function getAvailableLLMProviders() {
		const result = await callGetLLMProvidersApi({ api: getLLMProvidersApi });
		return result.llmProviders;
	}
	return {
		addTextGenerationNode,
		addTextNode,
		addConnection,
		getData,
		updateNodeData,
		setUiNodeState,
		deleteNode,
		deleteConnection,
		uploadFile,
		saveWorkspace,
		removeFile,
		addFileNode,
		createOpenAiVectorStore,
		getAvailableLLMProviders,
	};
}
