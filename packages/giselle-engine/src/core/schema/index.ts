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
