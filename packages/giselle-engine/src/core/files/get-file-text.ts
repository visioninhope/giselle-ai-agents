import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { filePath } from "./utils";

export async function getFileText(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
	fileId: FileId;
}) {
	return await args.context.storage.getItem(
		filePath({
			type: "workspace",
			id: args.workspaceId,
			fileId: args.fileId,
		}),
	);
}
