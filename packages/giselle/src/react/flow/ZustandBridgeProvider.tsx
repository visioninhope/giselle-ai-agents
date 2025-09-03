import {
	ConnectionId,
	type FileNode,
	type UploadedFileData,
	type Workspace,
} from "@giselle-sdk/data-type";
import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { useFeatureFlag } from "../feature-flags";
import { useGiselleEngine } from "../use-giselle-engine";
import { WorkflowDesignerContext } from "./context";
import {
	type AppStore,
	createFileSlice,
	createPropertiesPanelSlice,
	createViewSlice,
	createWorkspaceSlice,
	isSupportedConnection,
} from "./hooks";
import type { WorkflowDesignerContextValue } from "./types";

const DEFAULT_SAVE_DELAY = 1000;

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

	// Create store with auto-save directly integrated
	const store = useMemo(() => {
		let saveTimeout: ReturnType<typeof setTimeout> | null = null;

		const performSave = async (state: AppStore) => {
			if (!state.workspace) return;
			try {
				await client.updateWorkspace({
					workspace: state.workspace,
					useExperimentalStorage: experimental_storage,
				});
			} catch (error) {
				console.error("Failed to persist workspace:", error);
			}
		};

		const scheduleAutoSave = (state: AppStore) => {
			// Skip save if explicitly requested
			if (state._skipNextSave) {
				return;
			}

			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}

			saveTimeout = setTimeout(() => {
				performSave(state);
			}, saveWorkflowDelay);
		};

		return create<AppStore>()((set, get, api) => {
			// Subscribe to changes for auto-save
			api.subscribe((state, prevState) => {
				// Reset skip flag if it was set
				if (state._skipNextSave) {
					set({ _skipNextSave: false });
					return;
				}

				// Only save if workspace actually changed
				if (state.workspace !== prevState.workspace) {
					scheduleAutoSave(state);
				}
			});

			return {
				...createWorkspaceSlice(set, get, api),
				...createViewSlice(set, get, api),
				...createFileSlice(set, get, api),
				...createPropertiesPanelSlice(set, get, api),
			};
		});
	}, [client, experimental_storage, saveWorkflowDelay]);

	// Initialize store with workspace data
	useEffect(() => {
		store.getState().initWorkspace(data);
	}, [store, data]);

	// Load initial data
	useEffect(() => {
		store.getState().loadInitialData(client);
	}, [store, client]);

	// Get current state
	const state = store();

	// Create context value that matches the existing API
	const contextValue = useMemo<WorkflowDesignerContextValue>(
		() => ({
			data,
			textGenerationApi,
			addNode: (node, options) => state.addNode(node, options?.ui),
			copyNode: state.copyNode,
			addConnection: (args) =>
				state.addConnection({ ...args, id: ConnectionId.generate() }),
			updateNodeData: (node, data) => state.updateNode(node.id, data),
			updateNodeDataContent: (node, content) =>
				state.updateNodeContent(node.id, content),
			setUiNodeState: state.setUiNodeState,
			deleteNode: state.deleteNode,
			deleteConnection: state.deleteConnection,
			uploadFile: (files: File[], node: FileNode) =>
				state.uploadFile(client, data.id, experimental_storage, files, node),
			removeFile: (uploadedFile: UploadedFileData) =>
				state.removeFile(client, data.id, experimental_storage, uploadedFile),
			llmProviders: state.llmProviders,
			isLoading: state.isLoading,
			setUiViewport: state.setUiViewport,
			updateName: state.updateWorkspaceName,
			isSupportedConnection,
			setCurrentShortcutScope: state.setCurrentShortcutScope,
			copiedNode: state.copiedNode,
			setCopiedNode: state.setCopiedNode,
			propertiesTab: state.propertiesTab,
			setPropertiesTab: state.setPropertiesTab,
			openPropertiesPanel: state.openPropertiesPanel,
			setOpenPropertiesPanel: state.setOpenPropertiesPanel,
		}),
		[state, textGenerationApi, client, data, experimental_storage],
	);

	// Wait for workspace to be initialized
	if (!state.workspace) {
		return null;
	}

	return (
		<WorkflowDesignerContext.Provider value={contextValue}>
			{children}
		</WorkflowDesignerContext.Provider>
	);
}
