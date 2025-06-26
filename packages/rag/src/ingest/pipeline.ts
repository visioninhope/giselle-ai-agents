import type { ChunkStore } from "../chunk-store/types";
import { createDefaultChunker } from "../chunker";
import type { ChunkerFunction } from "../chunker/types";
import type { Document, DocumentLoader } from "../document-loader/types";
import { createDefaultEmbedder } from "../embedder";
import type { EmbedderFunction } from "../embedder/types";
import { ConfigurationError, OperationError } from "../errors";
import { embedContent } from "./embedder";
import { retryOperation } from "./retry";
import type { IngestError, IngestProgress, IngestResult } from "./types";

// Type helper to extract metadata type from ChunkStore
type InferChunkMetadata<T> = T extends ChunkStore<infer M> ? M : never;

export interface IngestPipelineOptions<
	TDocMetadata extends Record<string, unknown>,
	TStore extends ChunkStore<Record<string, unknown>>,
> {
	// Required configuration
	documentLoader: DocumentLoader<TDocMetadata>;
	chunkStore: TStore;
	documentKey: (metadata: TDocMetadata) => string;
	metadataTransform: (metadata: TDocMetadata) => InferChunkMetadata<TStore>;

	// Optional processors
	chunker?: ChunkerFunction;
	embedder?: EmbedderFunction;

	// Optional settings
	maxBatchSize?: number;
	maxRetries?: number;
	retryDelay?: number;
	onProgress?: (progress: IngestProgress) => void;
	onError?: (error: IngestError) => void;
}

const DEFAULT_MAX_BATCH_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export type IngestFunction = () => Promise<IngestResult>;

/**
 * Create an ingest pipeline function with the given options
 */
export function createPipeline<
	TDocMetadata extends Record<string, unknown>,
	TStore extends ChunkStore<Record<string, unknown>>,
>(options: IngestPipelineOptions<TDocMetadata, TStore>): IngestFunction {
	// Extract and set defaults for all options
	const {
		documentLoader,
		chunkStore,
		documentKey,
		metadataTransform,
		chunker = createDefaultChunker(),
		embedder,
		maxBatchSize = DEFAULT_MAX_BATCH_SIZE,
		maxRetries = DEFAULT_MAX_RETRIES,
		retryDelay = DEFAULT_RETRY_DELAY,
		onProgress = () => {},
		onError = () => {},
	} = options;

	let resolvedEmbedder = embedder;
	if (resolvedEmbedder == null) {
		try {
			resolvedEmbedder = createDefaultEmbedder();
		} catch (error) {
			throw ConfigurationError.missingField("OPENAI_API_KEY", {
				cause: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Process a single document
	 */
	async function processDocument(
		document: Document<TDocMetadata>,
	): Promise<void> {
		let docKey: string;
		let targetMetadata: InferChunkMetadata<TStore>;
		try {
			docKey = documentKey(document.metadata);
			targetMetadata = metadataTransform(document.metadata);
		} catch (error) {
			throw OperationError.invalidOperation(
				"processDocument",
				"Failed to process document metadata",
				{ cause: error instanceof Error ? error.message : String(error) },
			);
		}

		await retryOperation(
			async () => {
				const chunks = await embedContent(
					document.content,
					chunker,
					resolvedEmbedder as EmbedderFunction,
					maxBatchSize,
				);
				await chunkStore.insert(docKey, chunks, targetMetadata);
			},
			{
				maxRetries,
				retryDelay,
				onError,
				context: docKey,
			},
		);
	}

	/**
	 * The main ingest function
	 */
	return async function ingest(): Promise<IngestResult> {
		const result: IngestResult = {
			totalDocuments: 0,
			successfulDocuments: 0,
			failedDocuments: 0,
			errors: [],
		};

		const progress: IngestProgress = {
			processedDocuments: 0,
			currentDocument: undefined,
		};

		try {
			for await (const metadata of documentLoader.loadMetadata()) {
				let docKey: string;
				try {
					docKey = documentKey(metadata);
				} catch (error) {
					result.failedDocuments++;
					result.errors.push({
						document: "<unknown>",
						error: error instanceof Error ? error : new Error(String(error)),
					});
					continue;
				}

				const document = await documentLoader.loadDocument(metadata);
				if (!document) {
					continue;
				}

				result.totalDocuments++;
				progress.currentDocument = docKey;

				try {
					await processDocument(document);
					result.successfulDocuments++;
				} catch (error) {
					result.failedDocuments++;
					result.errors.push({
						document: docKey,
						error: error instanceof Error ? error : new Error(String(error)),
					});
				}

				progress.processedDocuments++;
				onProgress?.(progress);
			}
		} catch (error) {
			throw OperationError.invalidOperation(
				"ingestion pipeline",
				"Failed to complete ingestion pipeline",
				{ cause: error instanceof Error ? error.message : String(error) },
			);
		}

		return result;
	};
}
