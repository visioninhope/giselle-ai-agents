import type { z } from "zod/v4";
import { PoolManager } from "../../database/postgres";
import { ensurePgVectorTypes } from "../../database/postgres/pgvector-registry";
import type { ColumnMapping, DatabaseConfig } from "../../database/types";
import { DatabaseError } from "../../errors";
import type { ChunkStore, ChunkWithEmbedding } from "../types";
import {
	deleteChunksByDocumentKey,
	insertChunkRecords,
	prepareChunkRecords,
	validateMetadata,
} from "./utils";

/**
 * Configuration for PostgreSQL chunk store
 */
export interface PostgresChunkStoreConfig<TMetadata> {
	database: DatabaseConfig;
	tableName: string;
	columnMapping: ColumnMapping<TMetadata>;
	metadataSchema: z.ZodType<TMetadata>;
	staticContext?: Record<string, unknown>;
}

/**
 * Create a PostgreSQL chunk store
 */
export function createPostgresChunkStore<
	TSchema extends z.ZodType<Record<string, unknown>>,
>(config: PostgresChunkStoreConfig<z.infer<TSchema>>): ChunkStore<z.infer<TSchema>> {
	const { database, tableName, columnMapping, metadataSchema, staticContext } =
		config;

	/**
	 * Insert chunks with metadata
	 */
	async function insert(
		documentKey: string,
		chunks: ChunkWithEmbedding[],
		metadata: z.infer<TSchema>,
	): Promise<void> {
		// Validate metadata first
		validateMetadata(metadata, metadataSchema, { documentKey, tableName });

		// Early return for empty chunks
		if (chunks.length === 0) {
			return;
		}

		const pool = PoolManager.getPool(database);
		const client = await pool.connect();

		try {
			// Register pgvector types once per connection
			await ensurePgVectorTypes(client, database.connectionString);

			// Start transaction
			await client.query("BEGIN");

			// Delete existing chunks
			await deleteChunksByDocumentKey(
				client,
				tableName,
				documentKey,
				columnMapping.documentKey,
				staticContext,
			);

			// Prepare and insert new chunks
			const records = prepareChunkRecords(
				documentKey,
				chunks,
				metadata,
				columnMapping,
				staticContext,
			);
			await insertChunkRecords(client, tableName, records);

			await client.query("COMMIT");
		} catch (error) {
			await client.query("ROLLBACK");
			throw DatabaseError.transactionFailed(
				"chunk insertion",
				error instanceof Error ? error : undefined,
				{
					operation: "insert",
					documentKey,
					tableName,
					chunkCount: chunks.length,
				},
			);
		} finally {
			client.release();
		}
	}

	/**
	 * Delete chunks by document key
	 */
	async function deleteByDocumentKey(documentKey: string): Promise<void> {
		const pool = PoolManager.getPool(database);
		const client = await pool.connect();

		try {
			await ensurePgVectorTypes(client, database.connectionString);
			await deleteChunksByDocumentKey(
				client,
				tableName,
				documentKey,
				columnMapping.documentKey,
				staticContext,
			);
		} catch (error) {
			throw DatabaseError.queryFailed(
				`DELETE FROM ${tableName}`,
				error instanceof Error ? error : undefined,
				{
					operation: "deleteByDocumentKey",
					documentKey,
					tableName,
				},
			);
		} finally {
			client.release();
		}
	}

	return {
		insert,
		deleteByDocumentKey,
	};
}
