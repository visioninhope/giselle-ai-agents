import type { PoolClient } from "pg";
import { escapeIdentifier } from "pg";
import * as pgvector from "pgvector/pg";
import { ConfigurationError } from "../../errors";
import type { ColumnMapping } from "../column-mapping";
import { REQUIRED_COLUMN_KEYS } from "../column-mapping";
import type { ChunkWithEmbedding } from "../types";

const PERFORMANCE_CONSTANTS = {
	/**
	 * Maximum number of records to insert in a single batch
	 * Limited by PostgreSQL parameter limit (typically 65535)
	 * With ~10 columns per record, this allows safe batching
	 */
	MAX_BATCH_SIZE: 5000,
} as const;

/**
 * Helper for building parameterized SQL queries
 * Automatically tracks parameter indices and builds the values array
 */
function createParamHelper() {
	const values: unknown[] = [];
	return {
		add(value: unknown): string {
			values.push(value);
			return `$${values.length}`;
		},
		values() {
			return values;
		},
	};
}

type ChunkRecord = {
	record: Record<string, unknown>;
	embedding: {
		embeddingColumn: string;
		embeddingValue: number[];
		embeddingProfileId: number;
		embeddingDimensions: number;
	};
};

/**
 * Map metadata to column names
 */
export function mapMetadataToColumns<TMetadata extends Record<string, unknown>>(
	metadata: TMetadata,
	columnMapping: ColumnMapping<TMetadata>,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(metadata)) {
		if (
			key in columnMapping &&
			!REQUIRED_COLUMN_KEYS.includes(
				key as (typeof REQUIRED_COLUMN_KEYS)[number],
			)
		) {
			const columnName = columnMapping[key as keyof typeof columnMapping];
			result[columnName] = value;
		}
	}

	return result;
}

/**
 * Delete chunks by document key
 */
export async function deleteChunksByDocumentKey(
	client: PoolClient,
	tableName: string,
	documentKey: string,
	documentKeyColumn: string,
	scope: Record<string, unknown>,
	embeddingProfileId: number,
	embeddingDimensions: number,
): Promise<void> {
	const param = createParamHelper();
	const conditions: string[] = [];

	// Add conditions with automatic parameter tracking
	conditions.push(
		`${escapeIdentifier(documentKeyColumn)} = ${param.add(documentKey)}`,
	);
	conditions.push(`embedding_profile_id = ${param.add(embeddingProfileId)}`);
	conditions.push(`embedding_dimensions = ${param.add(embeddingDimensions)}`);

	// Add scope conditions (sorted for stability)
	const scopeKeys = Object.keys(scope).sort();
	for (const key of scopeKeys) {
		conditions.push(`${escapeIdentifier(key)} = ${param.add(scope[key])}`);
	}

	const query = `
        DELETE FROM ${escapeIdentifier(tableName)}
        WHERE ${conditions.join(" AND ")}
    `;

	await client.query(query, param.values());
}

/**
 * Prepare chunk records for insertion
 */
export function prepareChunkRecords<TMetadata extends Record<string, unknown>>(
	documentKey: string,
	chunks: ChunkWithEmbedding[],
	metadata: TMetadata,
	columnMapping: ColumnMapping<TMetadata>,
	scope: Record<string, unknown>,
	embeddingProfileId: number,
	embeddingDimensions: number,
): ChunkRecord[] {
	const metadataColumns = mapMetadataToColumns(metadata, columnMapping);

	return chunks.map((chunk) => ({
		record: {
			[columnMapping.documentKey]: documentKey,
			[columnMapping.chunkContent]: chunk.content,
			[columnMapping.chunkIndex]: chunk.index,
			...metadataColumns,
			...scope,
		},
		embedding: {
			embeddingColumn: columnMapping.embedding,
			embeddingValue: chunk.embedding,
			embeddingProfileId,
			embeddingDimensions,
		},
	}));
}

/**
 * Insert a single batch of records
 */
async function insertRecordsBatch(
	client: PoolClient,
	tableName: string,
	records: ChunkRecord[],
): Promise<void> {
	if (records.length === 0) {
		return;
	}

	// Get column names from the first record
	const firstRecord = records[0];
	const columns = [
		...Object.keys(firstRecord.record),
		firstRecord.embedding.embeddingColumn,
		"embedding_profile_id",
		"embedding_dimensions",
	];

	const param = createParamHelper();
	const valuePlaceholders: string[] = [];

	// Build value placeholders for each record
	for (const item of records) {
		const placeholders = columns.map((column) => {
			if (column === item.embedding.embeddingColumn) {
				return param.add(pgvector.toSql(item.embedding.embeddingValue));
			}
			if (column === "embedding_profile_id") {
				return param.add(item.embedding.embeddingProfileId);
			}
			if (column === "embedding_dimensions") {
				return param.add(item.embedding.embeddingDimensions);
			}
			return param.add(item.record[column]);
		});
		valuePlaceholders.push(`(${placeholders.join(", ")})`);
	}

	const query = `
		INSERT INTO ${escapeIdentifier(tableName)}
		(${columns.map((c) => escapeIdentifier(c)).join(", ")})
		VALUES ${valuePlaceholders.join(", ")}
	`;

	await client.query(query, param.values());
}

/**
 * Insert chunk records with batching
 */
export async function insertChunkRecords(
	client: PoolClient,
	tableName: string,
	records: ChunkRecord[],
): Promise<void> {
	// Process in batches if records exceed safe limit
	if (records.length > PERFORMANCE_CONSTANTS.MAX_BATCH_SIZE) {
		for (
			let i = 0;
			i < records.length;
			i += PERFORMANCE_CONSTANTS.MAX_BATCH_SIZE
		) {
			const batch = records.slice(i, i + PERFORMANCE_CONSTANTS.MAX_BATCH_SIZE);
			await insertRecordsBatch(client, tableName, batch);
		}
		return;
	}

	// Single batch insert for smaller datasets
	await insertRecordsBatch(client, tableName, records);
}

/**
 * Delete chunks by multiple document keys
 */
export async function deleteChunksByDocumentKeys(
	client: PoolClient,
	tableName: string,
	documentKeys: string[],
	documentKeyColumn: string,
	scope: Record<string, unknown>,
	embeddingProfileId: number,
	embeddingDimensions: number,
): Promise<void> {
	if (documentKeys.length === 0) {
		return;
	}

	const param = createParamHelper();
	const conditions: string[] = [];

	// Add conditions with automatic parameter tracking
	conditions.push(`embedding_profile_id = ${param.add(embeddingProfileId)}`);
	conditions.push(`embedding_dimensions = ${param.add(embeddingDimensions)}`);

	// Add scope conditions (sorted for stability)
	const scopeKeys = Object.keys(scope).sort();
	for (const key of scopeKeys) {
		conditions.push(`${escapeIdentifier(key)} = ${param.add(scope[key])}`);
	}

	// Add IN clause for document keys
	const inPlaceholders = documentKeys.map((key) => param.add(key)).join(", ");
	conditions.push(
		`${escapeIdentifier(documentKeyColumn)} IN (${inPlaceholders})`,
	);

	const query = `
        DELETE FROM ${escapeIdentifier(tableName)}
        WHERE ${conditions.join(" AND ")}
    `;

	await client.query(query, param.values());
}

/**
 * Get document versions for differential ingestion
 */
export async function queryDocumentVersions(
	client: PoolClient,
	tableName: string,
	documentKeyColumn: string,
	versionColumn: string,
	scope: Record<string, unknown>,
	embeddingProfileId: number,
	embeddingDimensions: number,
): Promise<
	Array<{
		documentKey: string;
		version: string;
	}>
> {
	const param = createParamHelper();
	const conditions: string[] = [];

	// Add conditions with automatic parameter tracking
	conditions.push(`embedding_profile_id = ${param.add(embeddingProfileId)}`);
	conditions.push(`embedding_dimensions = ${param.add(embeddingDimensions)}`);

	// Add scope conditions (sorted for stability)
	const scopeKeys = Object.keys(scope).sort();
	for (const key of scopeKeys) {
		conditions.push(`${escapeIdentifier(key)} = ${param.add(scope[key])}`);
	}

	// Add version not null condition
	conditions.push(`${escapeIdentifier(versionColumn)} IS NOT NULL`);

	const query = `
        SELECT DISTINCT
            ${escapeIdentifier(documentKeyColumn)} as document_key,
            ${escapeIdentifier(versionColumn)} as version
        FROM ${escapeIdentifier(tableName)}
        WHERE ${conditions.join(" AND ")}
    `;

	const result = await client.query<{
		document_key: unknown;
		version: unknown;
	}>(query, param.values());
	return result.rows.map((row) => {
		return {
			documentKey: toColumnString(row.document_key, "documentKey"),
			version: toColumnString(row.version, "version"),
		};
	});
}

/**
 * Convert various types to string for database columns
 */
function toColumnString(v: unknown, columnName: string): string {
	if (v == null) {
		throw new ConfigurationError(
			`${columnName} column value is null`,
			columnName,
			{ value: v },
		);
	}
	if (typeof v === "string") {
		return v;
	}
	if (
		typeof v === "number" ||
		typeof v === "bigint" ||
		typeof v === "boolean"
	) {
		return String(v);
	}
	if (v instanceof Date) {
		return v.toISOString();
	}
	if (Array.isArray(v)) {
		throw new ConfigurationError(
			`${columnName} column has unsupported type: array. Expected string, number, boolean, or Date`,
			columnName,
			{ value: v, type: "array" },
		);
	}
	if (typeof v === "object") {
		throw new ConfigurationError(
			`${columnName} column has unsupported type: object. Expected string, number, boolean, or Date`,
			columnName,
			{ value: v, type: "object" },
		);
	}

	throw new ConfigurationError(
		`${columnName} column has unsupported type: ${typeof v}. Expected string, number, boolean, or Date`,
		columnName,
		{ value: v, type: typeof v },
	);
}
