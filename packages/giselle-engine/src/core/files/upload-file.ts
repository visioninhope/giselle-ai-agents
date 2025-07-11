import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleStorage } from "../experimental_storage";
import { filePath } from "./utils";

export async function uploadFile(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	useExperimentalStorage: boolean;
	file: File;
	workspaceId: WorkspaceId;
	fileId: FileId;
	fileName: string;
}) {
	const fileBuffer = await fileToBuffer(args.file);
	const path = filePath({
		type: "workspace",
		id: args.workspaceId,
		fileId: args.fileId,
	});
	if (args.useExperimentalStorage) {
		await args.experimental_storage.setBlob(path, fileBuffer);
	} else {
		await args.storage.setItemRaw(path, fileBuffer);
	}
}

async function fileToBuffer(file: File) {
	const buffer = await file.arrayBuffer();
	return Buffer.from(buffer);
}
