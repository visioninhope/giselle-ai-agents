import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import { filePath } from "../helpers/workspace-path";
import type { GiselleEngineContext } from "../types";

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
			fileName: args.fileName,
		}),
		fileBuffer,
	);
}

async function fileToBuffer(file: File): Promise<Buffer> {
	return file.arrayBuffer().then((buffer) => Buffer.from(buffer));
}
