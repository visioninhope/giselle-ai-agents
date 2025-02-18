import { Workspace, type WorkspaceId } from "@giselle-sdk/data-type";
import { getWorkspace } from "../core/schema";

export async function callGetWorkspaceApi({
	host = process.env.NEXT_PUBLIC_VERCEL_URL ?? "localhost:6180",
	api = "/api/giselle/get-workspace",
	workspaceId,
}: {
	api?: string;
	host?: string;
	workspaceId: WorkspaceId;
}) {
	const response = await fetch(`http://${host}${api}`, {
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
