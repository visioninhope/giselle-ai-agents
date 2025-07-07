import { createPostgresQueryService } from "@giselle-sdk/rag";
import { getTableName } from "drizzle-orm";
import { githubRepositoryEmbeddings } from "@/drizzle";
import { createDatabaseConfig } from "../database";
import { githubQueryMetadataSchema } from "../types";
import { resolveGitHubEmbeddingFilter } from "./resolver";

/**
 * Pre-configured GitHub query service instance
 */
export const gitHubQueryService = createPostgresQueryService({
	database: createDatabaseConfig(),
	tableName: getTableName(githubRepositoryEmbeddings),
	metadataSchema: githubQueryMetadataSchema,
	contextToFilter: resolveGitHubEmbeddingFilter,
	requiredColumnOverrides: {
		documentKey: "path",
	},
});
