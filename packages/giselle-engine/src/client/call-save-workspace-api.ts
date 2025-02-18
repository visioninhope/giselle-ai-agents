import { Workspace, type WorkspaceId } from "@giselle-sdk/data-type";
import { getWorkspace } from "../core/schema";

export async function callSaveWorkspaceApi({
	api = "/api/giselle/save-workspace",
	workspaceId,
	workspace,
}: {
	api?: string;
	workspaceId: WorkspaceId;
	workspace: Workspace;
}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			workspaceId,
			workspace: Workspace.parse(workspace),
		}),
	});
	const data = await response.json();
	return getWorkspace.output.parse(data);
}
