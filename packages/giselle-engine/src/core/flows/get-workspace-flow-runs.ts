import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { getWorkspaceIndex } from "../utils/workspace-index";
import { FlowRunIndexObject } from "./run/object";
import { workspaceFlowRunPath } from "./run/paths";

export async function getWorkspaceFlowRuns(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	return await getWorkspaceIndex({
		storage: args.context.storage,
		indexPath: workspaceFlowRunPath(args.workspaceId),
		itemSchema: FlowRunIndexObject,
	});
}
