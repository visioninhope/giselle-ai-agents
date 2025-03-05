import type { WorkspaceId } from "@giselle-sdk/data-type";
import { getWorkspace as getWorkspaceInternal } from "../helpers/get-workspace";
import type { GiselleEngineContext } from "../types";

export async function getWorkspace(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	return await getWorkspaceInternal({
		storage: args.context.storage,
		workspaceId: args.workspaceId,
	});
}
