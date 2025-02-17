import { Workspace, type WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import { workspacePath } from "./workspace-path";

export async function getWorkspace({
	storage,
	workspaceId,
}: {
	storage: Storage;
	workspaceId: WorkspaceId;
}) {
	const result = await storage.getItem(workspacePath(workspaceId));
	return Workspace.parse(result);
}
