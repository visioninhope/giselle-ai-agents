"use server";

import {
	ExternalServiceName,
	VercelBlobOperation,
	createLogger,
	waitForTelemetryExport,
	withCountMeasurement,
} from "@/lib/opentelemetry";
import { type ListBlobResult, del, list, put } from "@vercel/blob";

import { buildFileFolderPath, buildGraphPath } from "./lib/utils";
import type { FileData, Graph } from "./types";

export async function putGraph(graph: Graph) {
	const startTime = Date.now();
	const stringifiedGraph = JSON.stringify(graph);
	const result = await withCountMeasurement(
		createLogger("put-graph"),
		async () => {
			const result = await put(buildGraphPath(graph.id), stringifiedGraph, {
				access: "public",
			});

			return {
				blob: result,
				size: new TextEncoder().encode(stringifiedGraph).length,
			};
		},
		ExternalServiceName.VercelBlob,
		startTime,
		VercelBlobOperation.Put,
	);
	waitForTelemetryExport();
	return result.blob;
}

export async function remove(fileData: FileData) {
	const startTime = Date.now();
	function calcTotalSize(blobList: ListBlobResult): number {
		return blobList.blobs.reduce((sum, blob) => sum + blob.size, 0);
	}
	const { blobList } = await withCountMeasurement(
		createLogger("remove"),
		async () => {
			const result = await list({
				prefix: buildFileFolderPath(fileData.id),
			});
			return {
				blobList: result,
				size: calcTotalSize(result),
			};
		},
		ExternalServiceName.VercelBlob,
		startTime,
		VercelBlobOperation.List,
	);

	const startTimeDel = Date.now();
	if (blobList.blobs.length > 0) {
		await withCountMeasurement(
			createLogger("remove"),
			async () => {
				await del(blobList.blobs.map((blob) => blob.url));

				return {
					size: calcTotalSize(blobList),
				};
			},
			ExternalServiceName.VercelBlob,
			startTimeDel,
			VercelBlobOperation.Del,
		);
		waitForTelemetryExport();
	}
}
