import type { WorkspaceId } from "@giselle-sdk/data-type";
import { z } from "zod/v4";
import type { GiselleEngineContext } from "../types";
import { workspaceDataSourceIndexPath } from "./paths";
import { DataSourceIndexObject } from "./types/object";

export async function getWorkspaceDataSources(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	const workspaceDataSourceIndexLike = await args.context.storage.getItem(
		workspaceDataSourceIndexPath(args.workspaceId),
	);

	const parse = z
		.array(DataSourceIndexObject)
		.safeParse(workspaceDataSourceIndexLike);
	return parse.success ? parse.data : [];
}
