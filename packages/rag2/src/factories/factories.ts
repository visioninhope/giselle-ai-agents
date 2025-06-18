import type { PostgresChunkStoreConfig } from "../chunk-store/postgres";
import { PostgresChunkStore } from "../chunk-store/postgres";
import type { ChunkStore } from "../chunk-store/types";
import type {
	Document,
	DocumentLoader,
	DocumentLoaderParams,
} from "../document-loader/types";
import { ValidationError } from "../errors";
import { createIngestPipeline as createBasePipeline } from "../ingest";
import type { IngestError, IngestProgress } from "../ingest/types";
import type { PostgresQueryServiceConfig } from "../query-service/postgres";
import { PostgresQueryService } from "../query-service/postgres";
import type { ChunkStoreConfig, QueryServiceConfig } from "./types";
import {
	createColumnMapping,
	createDefaultChunker,
	createDefaultEmbedder,
} from "./utils";

/**
 * validate database config
 */
function validateDatabaseConfig(database: {
	connectionString: string;
	poolConfig?: {
		max?: number;
		idleTimeoutMillis?: number;
		connectionTimeoutMillis?: number;
	};
}) {
	if (!database.connectionString || database.connectionString.length === 0) {
		throw new ValidationError("Connection string is required", undefined, {
			operation: "validateDatabaseConfig",
			field: "connectionString",
		});
	}

	if (database.poolConfig) {
		if (database.poolConfig.max !== undefined && database.poolConfig.max < 0) {
			throw new ValidationError("Pool max must be non-negative", undefined, {
				operation: "validateDatabaseConfig",
				field: "poolConfig.max",
			});
		}
		if (
			database.poolConfig.max !== undefined &&
			database.poolConfig.max > 100
		) {
			throw new ValidationError("Pool max must be 100 or less", undefined, {
				operation: "validateDatabaseConfig",
				field: "poolConfig.max",
			});
		}
		if (
			database.poolConfig.idleTimeoutMillis !== undefined &&
			database.poolConfig.idleTimeoutMillis < 0
		) {
			throw new ValidationError(
				"Pool idle timeout must be non-negative",
				undefined,
				{
					operation: "validateDatabaseConfig",
					field: "poolConfig.idleTimeoutMillis",
				},
			);
		}
	}

	return database;
}

/**
 * create chunk store
 */
export function createChunkStore<
	TMetadata extends Record<string, unknown> = Record<string, never>,
>(options: ChunkStoreConfig<TMetadata>): PostgresChunkStore<TMetadata> {
	const database = validateDatabaseConfig(options.database);

	const columnMapping =
		options.columnMapping ||
		createColumnMapping({
			metadataSchema: options.metadataSchema,
			requiredColumnOverrides: options.requiredColumnOverrides,
			metadataColumnOverrides: options.metadataColumnOverrides,
		});

	const config: PostgresChunkStoreConfig<TMetadata> = {
		database,
		tableName: options.tableName,
		columnMapping,
		staticContext: options.staticContext,
		metadataSchema: options.metadataSchema,
	};

	return new PostgresChunkStore(config);
}

/**
 * create query service
 */
export function createQueryService<
	TContext,
	TMetadata extends Record<string, unknown> = Record<string, never>,
>(
	options: QueryServiceConfig<TContext, TMetadata>,
): PostgresQueryService<TContext, TMetadata> {
	const database = validateDatabaseConfig(options.database);

	const columnMapping =
		options.columnMapping ||
		createColumnMapping({
			metadataSchema: options.metadataSchema,
			requiredColumnOverrides: options.requiredColumnOverrides,
			metadataColumnOverrides: options.metadataColumnOverrides,
		});

	const config: PostgresQueryServiceConfig<TContext, TMetadata> = {
		database,
		tableName: options.tableName,
		embedder: options.embedder || createDefaultEmbedder(),
		columnMapping,
		contextToFilter: options.contextToFilter,
		metadataSchema: options.metadataSchema,
	};

	return new PostgresQueryService(config);
}

/**
 * Create an ingest pipeline with default chunker and embedder
 * This is a convenience function that uses sensible defaults
 */
export function createIngestPipeline<
	TMetadata extends Record<string, unknown> = Record<string, unknown>,
	TParams extends DocumentLoaderParams = DocumentLoaderParams,
>(config: {
	documentLoader: DocumentLoader<TMetadata, TParams>;
	chunkStore: ChunkStore<TMetadata>;
	documentKey: (document: Document<TMetadata>) => string;
	metadataTransform?: (metadata: TMetadata) => TMetadata;
	options?: {
		maxBatchSize?: number;
		onProgress?: (progress: IngestProgress) => void;
		onError?: (error: IngestError) => void;
	};
}) {
	// Use default embedder and chunker
	const embedder = createDefaultEmbedder();
	const chunker = createDefaultChunker();

	return createBasePipeline({
		...config,
		chunker,
		embedder,
		options: {
			maxBatchSize: config.options?.maxBatchSize ?? 50,
			onProgress: config.options?.onProgress,
			onError: config.options?.onError,
		},
	});
}
