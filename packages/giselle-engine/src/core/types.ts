import type { LanguageModelProvider } from "@giselle-sdk/language-model";
import type { Storage } from "unstorage";

export interface GiselleEngineContext {
	storage: Storage;
	llmProviders: LanguageModelProvider[];
}

interface GitHubAppIntegrationConfig {
	provider: "github-app";
	appId: string;
	privateKey: string;
	clientId: string;
	clientSecret: string;
}

interface GitHubPATIntegrationConfig {
	provider: "github-pat";
	token: string;
}

export type GiselleIntegrationConfig =
	| GitHubAppIntegrationConfig
	| GitHubPATIntegrationConfig;

export interface GiselleEngineConfig {
	storage: Storage;
	llmProviders?: LanguageModelProvider[];
	integrationConfigs?: GiselleIntegrationConfig[];
}
