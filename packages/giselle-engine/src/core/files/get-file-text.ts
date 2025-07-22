import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleStorage } from "../experimental_storage";
import { filePath } from "./utils";

export async function getFileText(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	useExperimentalStorage: boolean;
	workspaceId: WorkspaceId;
	fileId: FileId;
}) {
	const path = filePath({
		type: "studio",
		id: args.workspaceId,
		fileId: args.fileId,
	});
	if (args.useExperimentalStorage) {
		const blob = await args.experimental_storage.getBlob(path);
		return Buffer.from(blob).toString();
	}
	const textLike = await args.storage.getItem(path);
	if (typeof textLike !== "string") {
		return "";
	}
	return textLike;
}
