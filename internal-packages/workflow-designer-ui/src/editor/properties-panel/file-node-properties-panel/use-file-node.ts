import type { FileNode, UploadedFileData } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useCallback } from "react";
import { useToasts } from "../../../ui/toast";

export function useFileNode(node: FileNode) {
	const {
		updateNodeDataContent,
		uploadFile,
		removeFile: removeFileInternal,
	} = useWorkflowDesigner();
	const { error } = useToasts();
	const addFiles = useCallback(
		async (files: File[]) => {
			await uploadFile(files, node, {
				onError: (errorMessage) => {
					error(errorMessage);
				},
			});
		},
		[node, uploadFile, error],
	);

	const removeFile = useCallback(
		async (file: UploadedFileData) => {
			updateNodeDataContent(node, {
				files: node.content.files.filter((f) => f.id !== file.id),
			});
			await removeFileInternal(file);
		},
		[node, updateNodeDataContent, removeFileInternal],
	);

	return {
		addFiles,
		removeFile,
	};
}
