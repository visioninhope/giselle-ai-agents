import type { FileId, WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleStorage } from "../experimental_storage";
import { filePath } from "./utils";

/**
 * Copies a file within the storage using getItemRaw and setItemRaw.
 * @param args - The arguments for copying the file.
 * @param args.workspaceId - The ID of the workspace where the file resides.
 * @param args.sourceFileId - The ID of the source file.
 * @param args.destinationFileId - The ID of the destination file.
 * @param args.useExperimentalStorage - Whether to use the experimental storage.
 * @returns A promise that resolves when the file is copied.
 * @throws Error if reading the source file or writing the destination file fails.
 */
export async function copyFile(args: {
	storage: Storage;
	experimental_storage: GiselleStorage;
	useExperimentalStorage: boolean;
	workspaceId: WorkspaceId;
	sourceFileId: FileId;
	destinationFileId: FileId;
}) {
	const {
		storage,
		experimental_storage,
		useExperimentalStorage,
		workspaceId,
		sourceFileId,
		destinationFileId,
	} = args;

	const sourcePath = filePath({
		type: "workspace",
		id: workspaceId,
		fileId: sourceFileId,
	});
	const destinationPath = filePath({
		type: "workspace",
		id: workspaceId,
		fileId: destinationFileId,
	});

	try {
		if (useExperimentalStorage) {
			await experimental_storage.copy(sourcePath, destinationPath);
			return;
		}

		const fileContent = await storage.getItemRaw(sourcePath);

		if (fileContent === null || fileContent === undefined) {
			throw new Error(
				`Source file not found or could not be read: ${sourcePath}`,
			);
		}

		await storage.setItemRaw(destinationPath, fileContent);

		// console.log(
		// 	`File copied successfully from ${sourcePath} to ${destinationPath}`,
		// );
	} catch (error) {
		console.error(
			`Failed to copy file from ${sourcePath} to ${destinationPath}:`,
			error,
		);
		if (error instanceof Error) {
			throw new Error(
				`File copy failed: ${error.message} (Source: ${sourcePath}, Destination: ${destinationPath})`,
			);
		}
		throw new Error(
			`An unknown error occurred during file copy (Source: ${sourcePath}, Destination: ${destinationPath})`,
		);
	}
}
