import type { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import { setWorkspace } from "../helpers/set-workspace";
import type { GiselleEngineContext } from "../types";

export async function updateWorkspace(args: {
	context: GiselleEngineContext;
	workspace: Workspace;
}) {
	await setWorkspace({
		storage: args.context.storage,
		workspaceId: args.workspace.id,
		workspace: args.workspace,
	});
	return args.workspace;
}
