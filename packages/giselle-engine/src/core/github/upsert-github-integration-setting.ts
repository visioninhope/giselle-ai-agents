import type { GitHubIntegrationSetting } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import {
	upsertGitHubIntegrationSetting as upsertGitHubIntegrationSettingInternal,
	upsertWorkspaceGitHubIntegrationSetting,
} from "./utils";

export async function upsertGithubIntegrationSetting(args: {
	context: GiselleEngineContext;
	integrationSetting: GitHubIntegrationSetting;
}) {
	await Promise.all([
		await upsertGitHubIntegrationSettingInternal({
			storage: args.context.storage,
			integrationSetting: args.integrationSetting,
		}),
		await upsertWorkspaceGitHubIntegrationSetting({
			storage: args.context.storage,
			integrationSetting: args.integrationSetting,
		}),
	]);
}
