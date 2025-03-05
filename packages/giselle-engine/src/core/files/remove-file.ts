import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import { filePath } from "../helpers/workspace-path";
import type { GiselleEngineContext } from "../types";

export async function removeFile(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
	fileId: FileId;
	fileName: string;
}) {
	await args.context.storage.removeItem(
		filePath({
			type: "workspace",
			id: args.workspaceId,
			fileId: args.fileId,
			fileName: args.fileName,
		}),
	);
}
