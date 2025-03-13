import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { getWorkspaceGitHubIntegrationSetting as getWorkspaceGitHubIntegrationSettingInternal } from "./utils";

export async function getWorkspaceGitHubIntegrationSetting(args: {
	context: GiselleEngineContext;
	workspaceId: WorkspaceId;
}) {
	return await getWorkspaceGitHubIntegrationSettingInternal({
		storage: args.context.storage,
		workspaceId: args.workspaceId,
	});
}
