import {
	type FetchedWebPage,
	type FetchingWebPage,
	FileId,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import { webSearch } from "@giselle-sdk/web-search";
import { filePath } from "../files/utils";
import type { GiselleEngineContext } from "../types";

export async function addWebPage(args: {
	webpage: FetchingWebPage;
	workspaceId: WorkspaceId;
	provider?: "self-made";
	context: GiselleEngineContext;
}) {
	const search = webSearch({ provider: args.provider ?? "self-made" });
	const result = await search.fetchUrl(args.webpage.url);
	const file = new File([result.html], "webpage.html", { type: "text/html" });

	const fileId = FileId.generate();

	await args.context.storage.setItemRaw(
		filePath({
			type: "workspace",
			id: args.workspaceId,
			fileId,
		}),
		file,
		{
			contentType: "text/html",
		},
	);
	const webpage: FetchedWebPage = {
		...args.webpage,
		status: "fetched",
		title: result.title,
		favicon: "",
		fileId,
	};
	return webpage;
}
