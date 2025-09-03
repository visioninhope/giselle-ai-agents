import {
	ConnectionId,
	type FileNode,
	type UploadedFileData,
	type Workspace,
} from "@giselle-sdk/data-type";
import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { useFeatureFlag } from "../feature-flags";
import { useGiselleEngine } from "../use-giselle-engine";
import { WorkflowDesignerContext } from "./context";
import {
	type AppStore,
	autoSave,
	createFileSlice,
	createPropertiesPanelSlice,
	createViewSlice,
	createWorkspaceSlice,
	isSupportedConnection,
} from "./hooks";
import type { WorkflowDesignerContextValue } from "./types";

const DEFAULT_SAVE_DELAY = 1000;

// The store creator function, now wrapped with the auto-save middleware
const createAppStore = (
	save: (ws: AppStore) => Promise<void>,
	saveDelay: number,
) => {
	return create<AppStore>()(
		autoSave(
			(...a) => ({
				...createWorkspaceSlice(...a),
				...createViewSlice(...a),
				...createFileSlice(...a),
				...createPropertiesPanelSlice(...a),
			}),
			{
				save,
				saveDelay,
				skipSaveFlag: "_skipNextSave",
			},
		),
	);
};

export function ZustandBridgeProvider({
	children,
	data,
	textGenerationApi = "/api/giselle/text-generation",
	saveWorkflowDelay = DEFAULT_SAVE_DELAY,
}: {
	children: React.ReactNode;
	data: Workspace;
	saveWorkflowApi?: string;
	textGenerationApi?: string;
	runAssistantApi?: string;
	saveWorkflowDelay?: number;
}) {
	const client = useGiselleEngine();
	const { experimental_storage } = useFeatureFlag();

	// Create the store instance, but only once, using useState
	const [useStore] = useState(() => {
		const save = async (storeState: AppStore) => {
			if (!storeState.workspace) return;
			try {
				await client.updateWorkspace({
					workspace: storeState.workspace,
					useExperimentalStorage: experimental_storage,
				});
			} catch (error) {
				console.error("Failed to persist graph:", error);
			}
		};
		return createAppStore(save, saveWorkflowDelay);
	});

	// Initialize the store with data from props
	useEffect(() => {
		useStore.getState().initWorkspace(data);
	}, [useStore, data]);

	// Trigger initial data loading
	useEffect(() => {
		useStore.getState().loadInitialData(client);
	}, [useStore, client]);

	// Select all state and actions from the store
	const store = useStore();

	// Assemble the value for the old context to ensure the API is identical
	const contextValue = useMemo<WorkflowDesignerContextValue>(
		() => ({
			data,
			textGenerationApi,
			addNode: (node, options) => store.addNode(node, options?.ui),
			copyNode: store.copyNode,
			addConnection: (args) =>
				store.addConnection({ ...args, id: ConnectionId.generate() }),
			updateNodeData: (node, data) => store.updateNode(node.id, data),
			updateNodeDataContent: (node, content) =>
				store.updateNodeContent(node.id, content),
			setUiNodeState: store.setUiNodeState,
			deleteNode: store.deleteNode,
			deleteConnection: store.deleteConnection,
			uploadFile: (files: File[], node: FileNode) =>
				store.uploadFile(client, data.id, experimental_storage, files, node),
			removeFile: (uploadedFile: UploadedFileData) =>
				store.removeFile(client, data.id, experimental_storage, uploadedFile),
			llmProviders: store.llmProviders,
			isLoading: store.isLoading,
			setUiViewport: store.setUiViewport,
			updateName: store.updateWorkspaceName,
			isSupportedConnection: isSupportedConnection,
			setCurrentShortcutScope: store.setCurrentShortcutScope,
			copiedNode: store.copiedNode,
			setCopiedNode: store.setCopiedNode,
			propertiesTab: store.propertiesTab,
			setPropertiesTab: store.setPropertiesTab,
			openPropertiesPanel: store.openPropertiesPanel,
			setOpenPropertiesPanel: store.setOpenPropertiesPanel,
		}),
		[store, textGenerationApi, client, data, experimental_storage],
	);

	// Render the old context provider with the new value from the Zustand store
	// The null check is for the initial render before the store is initialized
	if (!store.workspace) {
		return null;
	}

	return (
		<WorkflowDesignerContext.Provider value={contextValue}>
			{children}
		</WorkflowDesignerContext.Provider>
	);
}
