import type { z } from "zod";
import { uploadFile } from "../core/schema";

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
	const response = await fetch(api, {
		headers: {
			contentType: "multipart/form-data",
		},
		method: "POST",
		body: formData,
	});
	const unsafeJson = await response.json();
	return uploadFile.Output.parse(unsafeJson);
}
