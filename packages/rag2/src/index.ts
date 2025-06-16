// Errors
export {
	DatabaseError,
	EmbeddingError,
	RagError,
	ValidationError,
} from "./errors";

// Database
export { PoolManager } from "./database";
export type {
	ColumnMapping,
	DatabaseConfig,
	RequiredColumns,
} from "./database";

// Query Service
export { PostgresQueryService } from "./query-service";
export type {
	Chunk,
	DistanceFunction,
	PostgresQueryServiceConfig,
	QueryResult,
	QueryService,
} from "./query-service";

// Embedder
export { OpenAIEmbedder } from "./embedder";
export type { Embedder, OpenAIEmbedderConfig } from "./embedder";

// Simplified API with smart defaults
export {
	// Utilities
	createColumnMapping,
	// Default instances
	createDefaultEmbedder,
	createQueryService,
	DEFAULT_REQUIRED_COLUMNS,
	// Types
	type QueryServiceConfig,
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
	type OperationErrorCode,
} from "./errors";
