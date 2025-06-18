// Errors
export {
	DatabaseError,
	EmbeddingError,
	RagError,
	ValidationError
} from "./errors";

// Database
export { PoolManager } from "./database";
export type {
	ColumnMapping,
	DatabaseConfig,
	RequiredColumns
} from "./database";

// Chunk Store
export { createPostgresChunkStore } from "./chunk-store";
export type { Chunk, ChunkWithEmbedding, ChunkStore } from "./chunk-store";

// Chunker
export {
	createLineChunker,
	createDefaultChunker,
	DEFAULT_CHUNKER_CONFIG,
} from "./chunker";
export type { LineChunkerOptions, ChunkerFunction } from "./chunker";

// Document Loader
export type {
	Document,
	DocumentLoader,
	DocumentLoaderParams,
} from "./document-loader";

// Embedder
export { OpenAIEmbedder } from "./embedder";
export type { Embedder, OpenAIEmbedderConfig } from "./embedder";

// Ingest Pipeline
export { createIngestPipeline } from "./ingest";
export type {
	IngestPipelineOptions,
	IngestFunction,
	IngestError,
	IngestProgress,
	IngestResult,
} from "./ingest";

// Query Service
export { createPostgresQueryService } from "./query-service";
export type {
	QueryResult,
	QueryService
} from "./query-service";

// Utilities from factories
export {
	createColumnMapping,
	createDefaultEmbedder,
	DEFAULT_REQUIRED_COLUMNS
} from "./factories";

// Enhanced errors (additional classes and utilities)
export {
	// Additional error classes not exported above
	ConfigurationError,
	handleError,
	// Error utilities
	isErrorCategory,
	isErrorCode,
	OperationError,
	// Error types
	type DatabaseErrorCode,
	type EmbeddingErrorCode,
	type OperationErrorCode
} from "./errors";