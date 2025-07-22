import type { FileId } from "@giselle-sdk/data-type";
import type { GenerationOrigin } from "../generations/object";

export function filePath(params: { fileId: FileId } & GenerationOrigin) {
	switch (params.type) {
		case "workspace":
			return `workspaces/${params.id}/files/${params.fileId}/${params.fileId}`;

		case "run":
		case "act":
			return `workspaces/${params.workspaceId}/files/${params.fileId}/${params.fileId}`;
		default: {
			const _exhaustiveCheck: never = params;
			return _exhaustiveCheck;
		}
	}
}
