import {
	createFailedFileData,
	createUploadedFileData,
	createUploadingFileData,
	type FileId,
	type FileNode,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import { useCallback } from "react";
import { APICallError } from "../../errors";
import type { WorkspaceAction } from "./use-workspace-reducer";

type UploadOptions = { onError?: (message: string) => void } | undefined;

type FileUploadClient = {
	uploadFile: (input: {
		workspaceId: WorkspaceId;
		file: File;
		fileId: FileId;
		fileName: string;
		useExperimentalStorage: boolean;
	}) => Promise<unknown>;
};

export function useFileUploads(args: {
	dispatch: React.Dispatch<WorkspaceAction>;
	client: FileUploadClient;
	workspaceId: WorkspaceId;
	useExperimentalStorage: boolean;
}) {
	const { dispatch, client, workspaceId, useExperimentalStorage } = args;

	const uploadFile = useCallback(
		async (files: File[], node: FileNode, options: UploadOptions) => {
			// Track existing names and mark duplicates (exact match: name including extension)
			const reservedNames = new Set<string>(
				node.content.files.map((f) => f.name),
			);
			const preparedFiles = files.map((originalFile) => {
				const name = originalFile.name;
				const isDuplicate = reservedNames.has(name);
				if (!isDuplicate) {
					reservedNames.add(name);
				}
				return { file: originalFile, name, isDuplicate };
			});

			let fileContents = node.content.files;
			for (const { file, name, isDuplicate } of preparedFiles) {
				if (isDuplicate) {
					options?.onError?.(`duplicate file name: ${name}`);
					continue;
				}
				const uploadingFileData = createUploadingFileData({
					name,
					type: file.type,
					size: file.size,
				});
				fileContents = [...fileContents, uploadingFileData];
				dispatch({
					type: "UPDATE_FILE_STATUS",
					nodeId: node.id,
					files: fileContents,
				});
				try {
					await client.uploadFile({
						workspaceId,
						file,
						fileId: uploadingFileData.id,
						fileName: name,
						useExperimentalStorage,
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
				dispatch({
					type: "UPDATE_FILE_STATUS",
					nodeId: node.id,
					files: fileContents,
				});
			}
		},
		[client, dispatch, useExperimentalStorage, workspaceId],
	);

	return { uploadFile } as const;
}
