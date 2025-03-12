import type { WorkspaceGitHubIntegrationSetting } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import {
	upsertWorkspaceGitHubIntegrationSetting as upsertGitHubIntegrationSettingInternal,
	upsertWorkspcaeGitHubIntegrationResitorySetting,
} from "./utils";

export async function upsertGithubIntegrationSetting(args: {
	context: GiselleEngineContext;
	workspaceGitHubIntegrationSetting: WorkspaceGitHubIntegrationSetting;
}) {
	await Promise.all([
		await upsertGitHubIntegrationSettingInternal({
			storage: args.context.storage,
			workspaceGitHubIntegrationSetting: args.workspaceGitHubIntegrationSetting,
		}),
		await upsertWorkspcaeGitHubIntegrationResitorySetting({
			storage: args.context.storage,
			workspaceGitHubIntegrationSetting: args.workspaceGitHubIntegrationSetting,
		}),
	]);
}
