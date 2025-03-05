import {
	CreatedRun,
	FileId,
	NodeId,
	QueuedRun,
	RunId,
	UploadedFileData,
	WorkflowId,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import { z } from "zod";

export const uploadFile = {
	defaultApi: "/api/giselle/upload-file",
	Input: z.object({
		file: z.instanceof(File),
		workspaceId: WorkspaceId.schema,
		fileId: FileId.schema,
		fileName: z.string(),
	}),
};

export const removeFile = {
	defaultApi: "/api/giselle/remove-file",
	Input: z.object({
		workspaceId: WorkspaceId.schema,
		uploadedFile: UploadedFileData,
	}),
};

export const runAssistant = {
	defaultApi: "/api/giselle/run-assistant",
	Input: z.object({
		workspaceId: WorkspaceId.schema,
		nodeId: NodeId.schema,
		message: z.string(),
	}),
};

export const addRun = {
	defaultApi: "/api/giselle/add-run",
	Input: z.object({
		workspaceId: WorkspaceId.schema,
		workflowId: WorkflowId.schema,
		run: CreatedRun,
	}),
	Output: z.object({
		run: QueuedRun,
	}),
};

export const startRun = {
	defaultApi: "/api/giselle/start-run",
	Input: z.object({
		runId: RunId.schema,
	}),
};
