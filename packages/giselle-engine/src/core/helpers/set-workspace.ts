import type { Workspace, WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import { workspacePath } from "./workspace-path";

export async function setWorkspace({
	storage,
	workspaceId,
	workspace,
}: {
	storage: Storage;
	workspaceId: WorkspaceId;
	workspace: Workspace;
}) {
	await storage.setItem(workspacePath(workspaceId), workspace, {
		// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
		cacheControlMaxAge: 0,
	});
}
