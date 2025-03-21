import type { WorkspaceId } from "@giselle-sdk/data-type";
import type {
	GitHubAppUserAuth,
	GitHubInstallationAppAuth,
	GitHubTokenAuth,
} from "@giselle-sdk/github-client";
import type { LanguageModelProvider } from "@giselle-sdk/language-model";
import type { Storage } from "unstorage";

export interface GiselleEngineContext {
	storage: Storage;
	llmProviders: LanguageModelProvider[];
	integrationConfigs?: GiselleIntegrationConfig[];
	onConsumeAgentTime?: ConsumeAgentTimeCallback;
	telemetry?: {
		isEnabled?: boolean;
		waitForFlushFn?: () => Promise<unknown>;
	};
}

export interface GitHubIntegrationConfig {
	provider: "github";
	auth:
		| GitHubTokenAuth
		| Omit<GitHubAppUserAuth, "token" | "refreshToken">
		| Omit<GitHubInstallationAppAuth, "installationId">;
}

export type GiselleIntegrationConfig = GitHubIntegrationConfig;
export type ConsumeAgentTimeCallback = (
	workspaceId: WorkspaceId,
	startedAt: number,
	endedAt: number,
	totalDurationMs: number,
) => Promise<void>;

export interface GiselleEngineConfig {
	storage: Storage;
	llmProviders?: LanguageModelProvider[];
	integrationConfigs?: GiselleIntegrationConfig[];
	onConsumeAgentTime?: ConsumeAgentTimeCallback;
	telemetry?: {
		isEnabled?: boolean;
		waitForFlushFn?: () => Promise<unknown>;
	};
}
