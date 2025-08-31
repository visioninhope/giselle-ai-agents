"use client";

import type {
	ConnectionId,
	FileNode,
	InputId,
	Node,
	NodeId,
	NodeLike,
	NodeUIState,
	OutputId,
	ShortcutScope,
	UploadedFileData,
	Viewport,
	Workspace,
} from "@giselle-sdk/data-type";
import { createStore, type StoreApi } from "zustand";

export type WorkflowActions = {
	addNode: (node: Node, options?: { ui?: NodeUIState }) => void;
	addConnection: (args: {
		outputNode: NodeLike;
		outputId: OutputId;
		inputNode: NodeLike;
		inputId: InputId;
	}) => void;
	updateNodeData: <T extends Node>(node: T, data: Partial<T>) => void;
	updateNodeDataContent: <T extends Node>(
		node: T,
		content: Partial<T["content"]>,
	) => void;
	setUiNodeState: (
		nodeId: string | NodeId,
		ui: Partial<NodeUIState>,
		options?: { save?: boolean },
	) => void;
	setUiViewport: (viewport: Viewport) => void;
	setCurrentShortcutScope: (scope: ShortcutScope) => void;
	updateName: (name: string | undefined) => void;
	deleteNode: (nodeId: NodeId | string) => void;
	deleteConnection: (connectionId: ConnectionId) => void;
	uploadFile: (
		files: File[],
		node: FileNode,
		options?: { onError?: (error: string) => void },
	) => Promise<void>;
	removeFile: (uploadedFile: UploadedFileData) => Promise<void>;
	setCopiedNode: (node: NodeLike | null) => void;
};

export type WorkflowStore = {
	workspace: Workspace;
	isLoading: boolean;
	llmProviders: unknown[]; // keep broad to avoid leaking provider type here
	copiedNode: NodeLike | null;
	actions: WorkflowActions;
};

export function createWorkflowStore(initial: {
	workspace: Workspace;
	isLoading?: boolean;
	llmProviders?: unknown[];
	copiedNode?: NodeLike | null;
	actions?: Partial<WorkflowActions>;
}): StoreApi<WorkflowStore> {
	const store = createStore<WorkflowStore>()((_set) => ({
		workspace: initial.workspace,
		isLoading: initial.isLoading ?? true,
		llmProviders: initial.llmProviders ?? [],
		copiedNode: initial.copiedNode ?? null,
		actions: {
			addNode: initial.actions?.addNode ?? (() => {}),
			addConnection: initial.actions?.addConnection ?? (() => {}),
			updateNodeData: initial.actions?.updateNodeData ?? (() => {}),
			updateNodeDataContent:
				initial.actions?.updateNodeDataContent ?? ((_, __) => {}),
			setUiNodeState: initial.actions?.setUiNodeState ?? (() => {}),
			setUiViewport: initial.actions?.setUiViewport ?? (() => {}),
			setCurrentShortcutScope:
				initial.actions?.setCurrentShortcutScope ?? (() => {}),
			updateName: initial.actions?.updateName ?? (() => {}),
			deleteNode: initial.actions?.deleteNode ?? (() => {}),
			deleteConnection: initial.actions?.deleteConnection ?? (() => {}),
			uploadFile: initial.actions?.uploadFile ?? (async () => {}),
			removeFile: initial.actions?.removeFile ?? (async () => {}),
			setCopiedNode: initial.actions?.setCopiedNode ?? (() => {}),
		},
	}));

	return store;
}
