import type { GitHubQueryContext } from "@giselle-sdk/giselle-engine";
import type { TelemetrySettings } from "ai";
import { createEmbeddingTelemetrySettings } from "@/services/telemetry/embedding-telemetry";

/**
 * Create telemetry settings for GitHub query operations
 * @param context The GitHub query context containing workspaceId and repository info
 * @returns TelemetrySettings with team and operation metadata
 */
export async function createQueryTelemetrySettings(
	context: GitHubQueryContext,
): Promise<TelemetrySettings | undefined> {
	const { workspaceId, owner, repo } = context;

	return await createEmbeddingTelemetrySettings({
		operation: "github-repository-query",
		workspaceId,
		repository: `${owner}/${repo}`,
	});
}
