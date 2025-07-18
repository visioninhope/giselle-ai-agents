import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { filePath } from "./utils";

export async function uploadFile(args: {
	context: GiselleEngineContext;
	file: File;
	workspaceId: WorkspaceId;
	fileId: FileId;
	fileName: string;
}) {
	const fileBuffer = await fileToBuffer(args.file);
	await args.context.storage.setItemRaw(
		filePath({
			type: "workspace",
			id: args.workspaceId,
			fileId: args.fileId,
		}),
		fileBuffer,
	);
}

async function fileToBuffer(file: File) {
	const buffer = await file.arrayBuffer();
	return Buffer.from(buffer);
}
