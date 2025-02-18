import { Workspace, type WorkspaceId } from "@giselle-sdk/data-type";
import { getWorkspace } from "../core/schema";

export async function callGetWorkspaceApi({
	api = "/api/giselle/get-workspace",
	workspaceId,
}: {
	api?: string;
	workspaceId: WorkspaceId;
}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ workspaceId }),
	});
	const json = await response.json();
	const output = getWorkspace.output.parse(json);
	return Workspace.parse(output.workspace);
}
