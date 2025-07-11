import type {
	FetchingWebPage,
	FileId,
	FlowTrigger,
	FlowTriggerId,
	Generation,
	GenerationContextInput,
	GenerationId,
	GenerationOrigin,
	NodeId,
	QueuedGeneration,
	SecretId,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import { getLanguageModelProviders } from "./configurations/get-language-model-providers";
import { createDataSource, getWorkspaceDataSources } from "./data-source";
import type { DataSourceProviderObject } from "./data-source/types/object";
import { copyFile, getFileText, removeFile, uploadFile } from "./files";
import {
	type ConfigureTriggerInput,
	configureTrigger,
	createRun,
	deleteTrigger,
	getTrigger,
	getWorkspaceFlowRuns,
	type PatchDelta,
	patchRun,
	resolveTrigger,
	runFlow,
	setTrigger,
} from "./flows";
import type { FlowRunId } from "./flows/run/object";
import {
	cancelGeneration,
	generateImage,
	generateText,
	getGeneratedImage,
	getGeneration,
	getNodeGenerations,
	setGeneration,
	type TelemetrySettings,
} from "./generations";
import {
	getGitHubRepositories,
	getGitHubRepositoryFullname,
	handleGitHubWebhookV2,
} from "./github";
import { executeAction } from "./operations";
import { executeQuery } from "./operations/execute-query";
import { addSecret, deleteSecret, getWorkspaceSecrets } from "./secrets";
import { addWebPage } from "./sources";
import type { GiselleEngineConfig, GiselleEngineContext } from "./types";
import {
	copyWorkspace,
	createSampleWorkspace,
	createWorkspace,
	getWorkspace,
	updateWorkspace,
} from "./workspaces";

export * from "./experimental_storage";
export * from "./experimental_vector-store";
export { FlowRunId } from "./flows";
export * from "./integrations";
export * from "./telemetry";
export * from "./types";
export * from "./usage-limits";
export * from "./vault";
export * from "./vector-store";

export function GiselleEngine(config: GiselleEngineConfig) {
	const context: GiselleEngineContext = {
		...config,
		llmProviders: config.llmProviders ?? [],
		integrationConfigs: config.integrationConfigs ?? {},
		callbacks: config.callbacks,
	};
	return {
		copyWorkspace: async (workspaceId: WorkspaceId, name?: string) => {
			return await copyWorkspace({ context, workspaceId, name });
		},
		createWorkspace: async ({
			useExperimentalStorage,
		}: {
			useExperimentalStorage: boolean;
		}) => {
			return await createWorkspace({ context, useExperimentalStorage });
		},
		getWorkspace: async (
			workspaceId: WorkspaceId,
			useExperimentalStorage: boolean,
		) => {
			return await getWorkspace({
				context,
				workspaceId,
				useExperimentalStorage,
			});
		},
		updateWorkspace: async (
			workspace: Workspace,
			useExperimentalStorage: boolean,
		) => {
			return await updateWorkspace({
				context,
				workspace,
				useExperimentalStorage,
			});
		},
		getLanguageModelProviders: async () => {
			return await getLanguageModelProviders({ context });
		},
		generateText: async (
			generation: QueuedGeneration,
			telemetry?: TelemetrySettings,
		) => {
			return await generateText({
				context,
				generation,
				telemetry,
			});
		},
		getGeneration: async (generationId: GenerationId) => {
			return await getGeneration({ context, generationId });
		},
		getNodeGenerations: async (origin: GenerationOrigin, nodeId: NodeId) => {
			return await getNodeGenerations({ context, origin, nodeId });
		},
		cancelGeneration: async (generationId: GenerationId) => {
			return await cancelGeneration({ context, generationId });
		},
		copyFile: async (
			workspaceId: WorkspaceId,
			sourceFileId: FileId,
			destinationFileId: FileId,
		) => {
			return await copyFile({
				context,
				workspaceId,
				sourceFileId,
				destinationFileId,
			});
		},
		uploadFile: async (
			file: File,
			workspaceId: WorkspaceId,
			fileId: FileId,
			fileName: string,
		) => {
			return await uploadFile({ context, file, workspaceId, fileId, fileName });
		},
		removeFile: async (workspaceId: WorkspaceId, fileId: FileId) => {
			return await removeFile({ context, fileId, workspaceId });
		},
		generateImage: async (
			generation: QueuedGeneration,
			telemetry?: TelemetrySettings,
		) => {
			return await generateImage({
				context,
				generation,
				telemetry,
			});
		},
		getGeneratedImage: async (generationId: GenerationId, filename: string) => {
			return await getGeneratedImage({
				context,
				generationId,
				filename,
			});
		},
		setGeneration: async (generation: Generation) => {
			return await setGeneration({
				context,
				generation,
			});
		},
		createSampleWorkspace: async () => {
			return await createSampleWorkspace({ context });
		},
		getGitHubRepositories: async () => {
			return await getGitHubRepositories({ context });
		},
		encryptSecret: async (plaintext: string) => {
			if (context.vault === undefined) {
				console.warn("Vault is not set");
				return plaintext;
			}
			return await context.vault.encrypt(plaintext);
		},
		resolveTrigger: async (args: {
			generation: QueuedGeneration;
			useExperimentalStorage: boolean;
		}) => {
			return await resolveTrigger({ ...args, context });
		},
		configureTrigger: async (args: {
			trigger: ConfigureTriggerInput;
			useExperimentalStorage: boolean;
		}) => {
			return await configureTrigger({ ...args, context });
		},
		getTrigger: async (args: { flowTriggerId: FlowTriggerId }) => {
			return await getTrigger({ ...args, context });
		},
		getGitHubRepositoryFullname: async (args: {
			repositoryNodeId: string;
			installationId: number;
		}) => {
			return await getGitHubRepositoryFullname({ ...args, context });
		},
		setTrigger: async (args: { trigger: FlowTrigger }) =>
			setTrigger({ ...args, context }),
		deleteTrigger: async (args: { flowTriggerId: FlowTriggerId }) =>
			deleteTrigger({ ...args, context }),
		executeAction: async (args: { generation: QueuedGeneration }) =>
			executeAction({ ...args, context }),
		runFlow: async (args: {
			triggerId: FlowTriggerId;
			triggerInputs?: GenerationContextInput[];
			useExperimentalStorage: boolean;
		}) => runFlow({ ...args, context }),
		handleGitHubWebhookV2: async (args: { request: Request }) =>
			handleGitHubWebhookV2({ ...args, context }),
		executeQuery: async (
			generation: QueuedGeneration,
			telemetry?: TelemetrySettings,
		) => executeQuery({ context, generation, telemetry }),
		addWebPage: async (args: {
			workspaceId: WorkspaceId;
			webpage: FetchingWebPage;
		}) => addWebPage({ ...args, context }),
		async getFileText(args: { workspaceId: WorkspaceId; fileId: FileId }) {
			return await getFileText({ ...args, context });
		},
		async addSecret(args: {
			workspaceId: WorkspaceId;
			label: string;
			value: string;
			tags?: string[];
		}) {
			return await addSecret({ ...args, context });
		},
		async getWorkspaceSecrets(args: {
			workspaceId: WorkspaceId;
			tags?: string[];
		}) {
			return await getWorkspaceSecrets({ ...args, context });
		},
		async createDataSource(args: {
			workspaceId: WorkspaceId;
			dataSource: DataSourceProviderObject;
		}) {
			return await createDataSource({ ...args, context });
		},
		async getWorkspaceDataSources(args: { workspaceId: WorkspaceId }) {
			return await getWorkspaceDataSources({ ...args, context });
		},
		createRun(args: {
			workspaceId: WorkspaceId;
			jobsCount: number;
			trigger: string;
		}) {
			return createRun({ ...args, context });
		},
		patchRun(args: { flowRunId: FlowRunId; delta: PatchDelta }) {
			return patchRun({ ...args, context });
		},
		getWorkspaceFlowRuns(args: { workspaceId: WorkspaceId }) {
			return getWorkspaceFlowRuns({ ...args, context });
		},
		deleteSecret(args: { workspaceId: WorkspaceId; secretId: SecretId }) {
			return deleteSecret({ ...args, context });
		},
	};
}

export type GiselleEngine = ReturnType<typeof GiselleEngine>;

export * from "./error";
