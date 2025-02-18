import type {
	FileId,
	GenerationOrigin,
	WorkspaceId,
} from "@giselle-sdk/data-type";

export function workspacePath(workspaceId: WorkspaceId) {
	return `workspaces/${workspaceId}/workspace.json`;
}

export function filePath(
	params: { fileId: FileId; fileName: string } & GenerationOrigin,
) {
	switch (params.type) {
		case "workspace":
			return `workspaces/${params.id}/files/${params.fileId}/${params.fileName}`;

		case "run":
			return `runs/${params.id}/files/${params.fileId}/${params.fileName}`;
		default: {
			const _exhaustiveCheck: never = params;
			return _exhaustiveCheck;
		}
	}
}
