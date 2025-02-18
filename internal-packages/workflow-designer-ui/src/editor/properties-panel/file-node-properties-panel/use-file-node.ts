import type { FileNode, UploadedFileData } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useCallback } from "react";

export function useFileNode(node: FileNode) {
	const {
		updateNodeDataContent,
		uploadFile,
		removeFile: removeFileInternal,
	} = useWorkflowDesigner();
	const addFiles = useCallback(
		async (files: File[]) => {
			await uploadFile(files, node);
		},
		[node, uploadFile],
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
