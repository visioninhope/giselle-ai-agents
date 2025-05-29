import type { FileData, WebPageFileResult } from "@giselle-sdk/data-type";
import { FileId as FileIdGenerator } from "@giselle-sdk/data-type";
import { webSearch } from "@giselle-sdk/web-search";

export async function fetchWebPageFiles(args: {
	urls: string[];
	format: "markdown" | "html";
	provider?: "self-made";
}): Promise<WebPageFileResult[]> {
	const { urls, format, provider = "self-made" } = args;
	const search = webSearch({ provider });
	const results: WebPageFileResult[] = [];
	for (const url of urls) {
		const result = await search.fetchUrl(url, [format]);

		const content = format === "markdown" ? result.markdown : result.html;
		const mimeType = format === "markdown" ? "text/markdown" : "text/html";
		const fileName = result.url;
		const fileData: FileData = {
			id: FileIdGenerator.generate(),
			name: fileName,
			type: mimeType,
			size: content.length, // size in characters (not bytes)
			status: "uploading",
		};
		results.push({
			url: result.url,
			content,
			fileName,
			mimeType,
			fileData,
		});
	}
	return results;
}
