"use client";

import {
  type ActionNode,
  type ConnectionId,
  type FailedFileData,
  type FileContent,
  type FileNode,
  type Node,
  type NodeBase,
  NodeId,
  type NodeUIState,
  type TriggerNode,
  type UploadedFileData,
  type Viewport,
  type Workspace,
	createFailedFileData,
	createUploadedFileData,
	createUploadingFileData,
	isActionNode,
	isFileNode,
	isTriggerNode,
	isVectorStoreNode,
} from "@giselle-sdk/data-type";
import { GenerationRunnerSystemProvider } from "@giselle-sdk/giselle-engine/react";
import {
	APICallError,
	useGiselleEngine,
} from "@giselle-sdk/giselle-engine/react";
import type { LanguageModelProvider } from "@giselle-sdk/language-model";
import { isClonedFileDataPayload } from "@giselle-sdk/node-utils";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

import {
	useAddConnection,
	useAddNode,
	useCopyNode,
	useNodeUpdate,
	usePropertiesPanel,
	useView,
} from "./hooks";
import {
	ConnectionCloneStrategy,
	type WorkflowDesignerContextValue,
} from "./types";
import { isSupportedConnection } from "./utils";

const DEFAULT_SAVE_DELAY = 1000;

export const WorkflowDesignerContext = createContext<
	WorkflowDesignerContextValue | undefined
>(undefined);

type Timer = ReturnType<typeof setTimeout>;

export function WorkflowDesignerProvider({
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
	const [workspace, setWorkspace] = useState(data);
	const persistTimeoutRef = useRef<Timer | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [llmProviders, setLLMProviders] = useState<LanguageModelProvider[]>([]);

	const addNode = useAddNode(setWorkspace);
	const addConnection = useAddConnection(setWorkspace);
	const updateNodeData = useNodeUpdate(setWorkspace);
	const copyNode = useCopyNode(workspace, setWorkspace);

	useEffect(() => {
		client
			.getLanguageModelProviders()
			.then(setLLMProviders)
			.then(() => setIsLoading(false));
	}, [client]);

	const saveWorkspace = useCallback(async () => {
		try {
			await client.updateWorkspace({ workspace });
		} catch (error) {
			console.error("Failed to persist graph:", error);
		}
	}, [client, workspace]);

	const scheduleSave = useCallback(
		(delay?: number) => {
			if (persistTimeoutRef.current) {
				clearTimeout(persistTimeoutRef.current);
			}
			if (delay === 0) {
				void saveWorkspace();
				return;
			}
			persistTimeoutRef.current = setTimeout(
				saveWorkspace,
				delay ?? saveWorkflowDelay,
			);
		},
		[saveWorkspace, saveWorkflowDelay],
	);

	const setUiNodeState = useCallback(
		(
			nodeId: string | NodeId,
			ui: Partial<NodeUIState>,
			options?: { save?: boolean },
		) => {
      setWorkspace((ws) => {
        const id = NodeId.parse(nodeId);
        const nodeState = ws.ui.nodeState[id] ?? {};
				return {
					...ws,
					ui: {
						...ws.ui,
						nodeState: {
							...ws.ui.nodeState,
							[id]: { ...nodeState, ...ui },
						},
					},
				};
			});
			if (options?.save) {
				scheduleSave();
			}
		},
		[scheduleSave],
	);

	const setUiViewport = useCallback(
		(viewport: Viewport) => {
			setWorkspace((ws) => ({ ...ws, ui: { ...ws.ui, viewport } }));
			scheduleSave();
		},
		[scheduleSave],
	);

	const updateName = useCallback(
		(newName: string | undefined) => {
			setWorkspace((ws) => ({ ...ws, name: newName }));
			scheduleSave();
		},
		[scheduleSave],
	);

	const deleteNode = useCallback(
		async (nodeId: NodeId | string) => {
      setWorkspace((ws) => {
        const id = NodeId.parse(nodeId);
				const ui = { ...ws.ui };
				delete ui.nodeState[id];
				return { ...ws, ui, nodes: ws.nodes.filter((n) => n.id !== id) };
			});
			scheduleSave();
		},
		[scheduleSave],
	);

	const deleteConnection = useCallback(
		(connectionId: ConnectionId) => {
			setWorkspace((ws) => ({
				...ws,
				connections: ws.connections.filter((c) => c.id !== connectionId),
			}));
			scheduleSave();
		},
		[scheduleSave],
	);

	const updateNodeDataContent = useCallback(
		<T extends Node>(node: T, content: Partial<T["content"]>) => {
			updateNodeData(node, {
				content: { ...node.content, ...content },
			} as Partial<T>);
			scheduleSave();
		},
		[updateNodeData, scheduleSave],
	);

	const isSupportedConnectionCb = useCallback(isSupportedConnection, []);

	const uploadFile = useCallback<
		(
			files: File[],
			node: FileNode,
			options?: { onError?: (error: string) => void },
		) => Promise<void>
	>(
		async (files, node, options) => {
			const uploaders = files.map((file) => {
				return async () => {
					let fileContents: FileContent[] = node.content.files;
					if (fileContents.some((f) => f.name === file.name)) {
						options?.onError?.("duplicate file name");
						return;
					}
					const uploadingFileData = createUploadingFileData({
						name: file.name,
						type: file.type,
						size: file.size,
					});
					fileContents = [...fileContents, uploadingFileData];
          updateNodeDataContent(node, { files: fileContents } as any);
					try {
						await client.uploadFile({
							workspaceId: data.id,
							file,
							fileId: uploadingFileData.id,
							fileName: file.name,
						});
						const uploadedFileData = createUploadedFileData(
							uploadingFileData,
							Date.now(),
						);
						fileContents = [
							...fileContents.filter((f) => f.id !== uploadedFileData.id),
							uploadedFileData,
						];
					} catch (error) {
						if (APICallError.isInstance(error)) {
							const message =
								error.statusCode === 413 ? "filesize too large" : error.message;
							options?.onError?.(message);
							const failedFileData = createFailedFileData(
								uploadingFileData,
								message,
							);
							fileContents = [
								...fileContents.filter((f) => f.id !== failedFileData.id),
								failedFileData,
							];
						}
					}
          updateNodeDataContent(node, { files: fileContents } as any);
				};
			});
			for (const uploader of uploaders) {
				await uploader();
			}
		},
		[updateNodeDataContent, client, data.id],
	);

	const removeFile = useCallback(
		async (uploadedFile: UploadedFileData) => {
			await client.removeFile({
				workspaceId: data.id,
				fileId: uploadedFile.id,
			});
			scheduleSave();
		},
		[scheduleSave, client, data.id],
	);

	const propertiesPanelHelper = usePropertiesPanel();
	const viewHelper = useView();

	return (
		<WorkflowDesignerContext.Provider
			value={{
				data: workspace,
				textGenerationApi,
				addNode,
				copyNode,
				addConnection,
				updateNodeData,
				updateNodeDataContent,
				setUiNodeState,
				deleteNode,
				deleteConnection,
				uploadFile,
				removeFile,
				llmProviders,
				isLoading,
				setUiViewport,
				updateName,
				isSupportedConnection: isSupportedConnectionCb,
				...propertiesPanelHelper,
				...viewHelper,
			}}
		>
			<GenerationRunnerSystemProvider>
				{children}
			</GenerationRunnerSystemProvider>
		</WorkflowDesignerContext.Provider>
	);
}
