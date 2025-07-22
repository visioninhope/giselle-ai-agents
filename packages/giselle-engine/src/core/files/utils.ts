import type { FileId } from "@giselle-sdk/data-type";
import type { GenerationOrigin } from "../generations/object";

export function filePath(params: { fileId: FileId } & GenerationOrigin) {
	switch (params.type) {
		case "studio":
			return `workspaces/${params.id}/files/${params.fileId}/${params.fileId}`;

		case "stage":
		case "github-app":
			return `workspaces/${params.workspaceId}/files/${params.fileId}/${params.fileId}`;
		default: {
			const _exhaustiveCheck: never = params;
			return _exhaustiveCheck;
		}
	}
}
