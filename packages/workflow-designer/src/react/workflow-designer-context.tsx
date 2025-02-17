"use client";

import {
	type ConnectionHandle,
	type ConnectionId,
	type CreateFileNodeParams,
	type CreateTextGenerationNodeParams,
	type CreateTextNodeParams,
	type FileNode,
	type LLMProvider,
	type Node,
	type NodeBase,
	type NodeId,
	type NodeUIState,
	type UploadedFileData,
	type WorkflowId,
	type Workspace,
	createUploadedFileData,
	createUploadingFileData,
} from "@giselle-sdk/data-type";
import { GenerationRunnerSystemProvider } from "@giselle-sdk/generation-runner/react";
import { runAssistant } from "@giselle-sdk/giselle-engine/schema";
import { RunSystemContextProvider } from "@giselle-sdk/run/react";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { WorkflowDesigner } from "../workflow-designer";
import { usePropertiesPanel, useView } from "./state";

interface CreateWorkflowRunParams {
	workflowId: WorkflowId;
	onBeforeWorkflowRunCreate?: () => void;
}
export interface WorkflowDesignerContextValue
	extends Pick<
			WorkflowDesigner,
			| "updateNodeData"
			| "addConnection"
			| "addTextNode"
			| "deleteConnection"
			| "removeFile"
		>,
		ReturnType<typeof usePropertiesPanel>,
		ReturnType<typeof useView> {
	data: Workspace;
	textGenerationApi: string;
	runAssistantApi: string;
	setUiNodeState: (
		nodeId: string | NodeId,
		ui: Partial<NodeUIState>,
		options?: { save?: boolean },
	) => void;
	updateNodeDataContent: <T extends Node>(
		node: T,
		content: Partial<T["content"]>,
	) => void;
	addTextGenerationNode: (
		params: CreateTextGenerationNodeParams,
		options?: { ui?: NodeUIState },
	) => void;
	addFileNode: (
		params: CreateFileNodeParams,
		options?: {
			ui?: NodeUIState;
		},
	) => Promise<void>;
	uploadFile: (files: File[], node: FileNode) => Promise<void>;
	deleteNode: (nodeId: NodeId | string) => void;
	llmProviders: LLMProvider[];
	isLoading: boolean;
}
export const WorkflowDesignerContext = createContext<
	WorkflowDesignerContextValue | undefined
>(undefined);

type Timer = ReturnType<typeof setTimeout>;
export function WorkflowDesignerProvider({
	children,
	data,
	saveWorkflowApi = "/api/giselle/save-workspace",
	textGenerationApi = "/api/giselle/text-generation",
	runAssistantApi = runAssistant.defaultApi,
	saveWorkflowDelay: defaultSaveWorkflowDelay = 1000,
}: {
	children: React.ReactNode;
	data: Workspace;
	saveWorkflowApi?: string;
	textGenerationApi?: string;
	runAssistantApi?: string;
	saveWorkflowDelay?: number;
}) {
	const workflowDesignerRef = useRef(
		WorkflowDesigner({
			defaultValue: data,
			saveWorkflowApi,
		}),
	);
	const [workspace, setWorkspaceInternal] = useState(data);
	const persistTimeoutRef = useRef<Timer | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [llmProviders, setLLMProviders] = useState<LLMProvider[]>([]);

	useEffect(() => {
		workflowDesignerRef.current
			.getAvailableLLMProviders()
			.then(setLLMProviders)
			.then(() => setIsLoading(false));
	}, []);

	const saveWorkspace = useCallback(async () => {
		try {
			await workflowDesignerRef.current.saveWorkspace();
		} catch (error) {
			console.error("Failed to persist graph:", error);
		}
	}, []);

	const setWorkspace = useCallback(() => {
		const data = workflowDesignerRef.current.getData();
		setWorkspaceInternal(data);
	}, []);
	const setAndSaveWorkspace = useCallback(
		(saveWorkspaceDelay?: number) => {
			setWorkspace();
			if (persistTimeoutRef.current) {
				clearTimeout(persistTimeoutRef.current);
			}
			if (saveWorkspaceDelay === 0) {
				saveWorkspace();
				return;
			}
			persistTimeoutRef.current = setTimeout(
				saveWorkspace,
				saveWorkspaceDelay ?? defaultSaveWorkflowDelay,
			);
		},
		[setWorkspace, saveWorkspace, defaultSaveWorkflowDelay],
	);

	const addTextGenerationNode = useCallback(
		(
			params: CreateTextGenerationNodeParams,
			options?: { ui?: NodeUIState },
		) => {
			workflowDesignerRef.current.addTextGenerationNode(params, options);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const updateNodeData = useCallback(
		<T extends Node>(node: T, data: Partial<T>) => {
			workflowDesignerRef.current.updateNodeData(node, data);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const updateNodeDataContent = useCallback(
		<T extends Node>(node: T, content: Partial<T["content"]>) => {
			workflowDesignerRef.current.updateNodeData(node, {
				...node,
				content: { ...node.content, ...content },
			});
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const addConnection = useCallback(
		(sourceNode: NodeBase, targetHandle: ConnectionHandle) => {
			workflowDesignerRef.current?.addConnection(sourceNode, targetHandle);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const addTextNode = useCallback(
		(
			params: z.infer<typeof CreateTextNodeParams>,
			options?: { ui?: NodeUIState },
		) => {
			workflowDesignerRef.current.addTextNode(params, options);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const addFileNode = useCallback(
		async (params: CreateFileNodeParams, options?: { ui?: NodeUIState }) => {
			workflowDesignerRef.current.addFileNode(params, options);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const setUiNodeState = useCallback(
		(
			nodeId: string | NodeId,
			ui: Partial<NodeUIState>,
			options: { save?: boolean } | undefined,
		) => {
			workflowDesignerRef.current.setUiNodeState(nodeId, ui);
			if (options?.save) {
				setAndSaveWorkspace();
			} else {
				setWorkspace();
			}
		},
		[setAndSaveWorkspace, setWorkspace],
	);

	const deleteNode = useCallback(
		(nodeId: NodeId | string) => {
			workflowDesignerRef.current.deleteNode(nodeId);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const deleteConnection = useCallback(
		(connectionId: ConnectionId) => {
			workflowDesignerRef.current.deleteConnection(connectionId);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const uploadFile = useCallback(
		async (files: File[], node: FileNode) => {
			let fileContents = node.content.files;

			await Promise.all(
				files.map(async (file) => {
					const fileReader = new FileReader();
					fileReader.readAsArrayBuffer(file);
					fileReader.onload = async () => {
						if (!fileReader.result) {
							return;
						}
						const uploadingFileData = createUploadingFileData({
							name: file.name,
							contentType: file.type,
							size: file.size,
						});
						fileContents = [...fileContents, uploadingFileData];

						updateNodeDataContent(node, {
							files: fileContents,
						});
						const result = await workflowDesignerRef.current.uploadFile(
							file,
							uploadingFileData.id,
						);

						const uploadedFileData = createUploadedFileData(
							uploadingFileData,
							Date.now(),
							result.generatedTitle,
						);
						fileContents = [
							...fileContents.filter((file) => file.id !== uploadedFileData.id),
							uploadedFileData,
						];
						updateNodeDataContent(node, {
							files: fileContents,
						});
					};
				}),
			);
		},
		[updateNodeDataContent],
	);

	const removeFile = useCallback(
		async (uploadedFile: UploadedFileData) => {
			await workflowDesignerRef.current.removeFile(uploadedFile);
			setAndSaveWorkspace();
		},
		[setAndSaveWorkspace],
	);

	const usePropertiesPanelHelper = usePropertiesPanel();
	const useViewHelper = useView();

	return (
		<WorkflowDesignerContext.Provider
			value={{
				data: workspace,
				textGenerationApi,
				runAssistantApi,
				addTextGenerationNode,
				addTextNode,
				addConnection,
				updateNodeData,
				updateNodeDataContent,
				setUiNodeState,
				deleteNode,
				deleteConnection,
				uploadFile,
				removeFile,
				addFileNode,
				llmProviders,
				isLoading,
				...usePropertiesPanelHelper,
				...useViewHelper,
			}}
		>
			<GenerationRunnerSystemProvider>
				<RunSystemContextProvider workspaceId={data.id}>
					{children}
				</RunSystemContextProvider>
			</GenerationRunnerSystemProvider>
		</WorkflowDesignerContext.Provider>
	);
}
