import {
	createColumnMapping,
	createPostgresChunkStore,
} from "@giselle-sdk/rag";
import { getTableName } from "drizzle-orm";
import { githubRepositoryEmbeddings } from "@/drizzle";
import { createDatabaseConfig } from "../database";
import { githubChunkMetadataSchema } from "../types";

/**
 * GitHub Blob chunk store factory - for ingestion pipeline
 */
export function createGitHubBlobChunkStore(repositoryIndexDbId: number) {
	const columnMapping = createColumnMapping({
		metadataSchema: githubChunkMetadataSchema,
		requiredColumnOverrides: {
			documentKey: "path",
			version: "file_sha",
		},
	});

	return createPostgresChunkStore({
		database: createDatabaseConfig(),
		tableName: getTableName(githubRepositoryEmbeddings),
		columnMapping,
		metadataSchema: githubChunkMetadataSchema,
		scope: {
			repository_index_db_id: repositoryIndexDbId,
		},
	});
}
