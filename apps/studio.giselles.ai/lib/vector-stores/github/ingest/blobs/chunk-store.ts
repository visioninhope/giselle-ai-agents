import { createPostgresChunkStore } from "@giselle-sdk/rag";
import { getTableName } from "drizzle-orm";
import { githubRepositoryEmbeddings } from "@/drizzle";
import { createDatabaseConfig } from "../../database";
import { githubChunkMetadataSchema } from "../../types";

/**
 * GitHub Blob chunk store factory - for ingestion pipeline
 */
export function createGitHubBlobChunkStore(repositoryIndexDbId: number) {
	return createPostgresChunkStore({
		database: createDatabaseConfig(),
		tableName: getTableName(githubRepositoryEmbeddings),
		metadataSchema: githubChunkMetadataSchema,
		scope: {
			repository_index_db_id: repositoryIndexDbId,
		},
		requiredColumnOverrides: {
			documentKey: "path",
			version: "file_sha",
		},
	});
}
