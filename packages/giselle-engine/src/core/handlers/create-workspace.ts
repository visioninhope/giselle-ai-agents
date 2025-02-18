import { Workspace } from "@giselle-sdk/data-type";
import { createWorkspace, setWorkspace } from "../helpers";
import { createWorkspace as createWorkspaceSchema } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

export async function createWorkspaceHandler({
	context,
}: GiselleEngineHandlerArgs) {
	const workspace = await createWorkspace();

	await setWorkspace({
		storage: context.storage,
		workspaceId: workspace.id,
		workspace: Workspace.parse(workspace),
	});
	return createWorkspaceSchema.Output.parse({ workspace });
}
