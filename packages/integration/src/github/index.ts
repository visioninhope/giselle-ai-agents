import type { components } from "@octokit/openapi-types";
import { z } from "zod";

export const GitHubIntegrationUnsetState = z.object({
	status: z.literal("unset"),
});
export const GitHubIntegrationUnauthorizedState = z.object({
	status: z.literal("unauthorized"),
});
export const GitHubIntegrationInvalidCredentialState = z.object({
	status: z.literal("invalid-credential"),
});
export const GitHubIntegrationNotInstalledState = z.object({
	status: z.literal("not-installed"),
});
export type GitHubIntegrationRepository = components["schemas"]["repository"];
export const GitHubIntegrationInstalledState = z.object({
	status: z.literal("installed"),
	repositories: z.custom<GitHubIntegrationRepository[]>(),
});
export const GitHubIntegration = z.discriminatedUnion("status", [
	GitHubIntegrationUnsetState,
	GitHubIntegrationUnauthorizedState,
	GitHubIntegrationInvalidCredentialState,
	GitHubIntegrationNotInstalledState,
	GitHubIntegrationInstalledState,
]);
export type GitHubIntegration = z.infer<typeof GitHubIntegration>;
