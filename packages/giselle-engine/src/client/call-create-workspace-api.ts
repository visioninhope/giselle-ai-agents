import { Workspace } from "@giselle-sdk/data-type";
import { createWorkspace } from "../core/schema";

export async function callCreateWorkspaceApi({
	api = "/api/giselle/create-workspace",
}: {
	api?: string;
} = {}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});
	const data = await response.json();
	const output = createWorkspace.Output.parse(data);
	return Workspace.parse(output.workspace);
}
