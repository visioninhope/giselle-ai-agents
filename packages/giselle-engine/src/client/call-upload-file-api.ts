import type { z } from "zod";
import type { uploadFile } from "../core/schema";

export async function callUploadFileApi({
	api = "/api/giselle/upload-file",
	workspaceId,
	file,
	fileId,
	fileName,
}: {
	api?: string;
} & z.infer<typeof uploadFile.Input>) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("workspaceId", workspaceId);
	formData.append("fileId", fileId);
	formData.append("fileName", fileName);
	await fetch(api, {
		headers: {
			contentType: "multipart/form-data",
		},
		method: "POST",
		body: formData,
	});
}
