import { createEmbeddingTelemetrySettings } from "@/services/telemetry/embedding-telemetry";
import type { TelemetrySettings } from "ai";

/**
 * Create telemetry settings for GitHub repository ingestion
 * @param teamDbId The database ID of the team
 * @param repository The repository being ingested (owner/repo format)
 * @returns TelemetrySettings with team and operation metadata
 */
export async function createIngestTelemetrySettings(
	teamDbId: number,
	repository: string,
): Promise<TelemetrySettings | undefined> {
	return await createEmbeddingTelemetrySettings({
		operation: "github-repository-ingest",
		teamDbId,
		repository,
	});
}
