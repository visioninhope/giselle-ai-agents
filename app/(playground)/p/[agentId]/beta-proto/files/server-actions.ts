import { put } from "@vercel/blob";
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared";
import { elementsToMarkdown } from "../utils/unstructured";
import type { FileId } from "./types";

type UploadFileInput = {
	fileId: FileId;
	file: File;
};
export async function uploadFile({ input }: { input: UploadFileInput }) {
	const blob = await put(
		`files/${input.fileId}/${input.file.name}`,
		input.file,
		{
			access: "public",
			contentType: input.file.type,
		},
	);
	return blob;
}

type ParseFileInput = {
	id: FileId;
	name: string;
	blobUrl: string;
};
export async function parseFile(args: ParseFileInput) {
	if (process.env.UNSTRUCTURED_API_KEY === undefined) {
		throw new Error("UNSTRUCTURED_API_KEY is not set");
	}
	const client = new UnstructuredClient({
		security: {
			apiKeyAuth: process.env.UNSTRUCTURED_API_KEY,
		},
	});
	const response = await fetch(args.blobUrl);
	const content = await response.blob();
	const partitionReponse = await client.general.partition({
		partitionParameters: {
			files: {
				fileName: args.name,
				content,
			},
			strategy: Strategy.Fast,
			splitPdfPage: false,
			splitPdfConcurrencyLevel: 1,
		},
	});
	if (partitionReponse.statusCode !== 200) {
		console.error(partitionReponse.rawResponse);
		throw new Error(`Failed to parse file: ${partitionReponse.statusCode}`);
	}
	const jsonString = JSON.stringify(partitionReponse.elements, null, 2);
	const blob = new Blob([jsonString], { type: "application/json" });

	await put(`files/${args.id}/partition.json`, blob, {
		access: "public",
		contentType: blob.type,
	});

	const markdown = elementsToMarkdown(partitionReponse.elements ?? []);
	const markdownBlob = new Blob([markdown], { type: "text/markdown" });
	const vercelBlob = await put(`files/${args.id}/markdown.md`, markdownBlob, {
		access: "public",
		contentType: markdownBlob.type,
	});

	return vercelBlob;
}
