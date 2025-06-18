import type { ChunkStore } from "../chunk-store/types";
import type { ChunkerFunction } from "../chunker/types";
import type {
	Document,
	DocumentLoader,
	DocumentLoaderParams,
} from "../document-loader/types";
import type { EmbedderFunction } from "../embedder/types";
import { OperationError } from "../errors";
import type { IngestError, IngestProgress, IngestResult } from "./types";

/**
 * Create an ingest pipeline with automatic type inference
 * Supports different metadata types for document loader and chunk store
 * @param config Pipeline configuration
 * @returns A function that runs the ingestion process
 */
export function createIngestPipeline<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
	TParams extends DocumentLoaderParams = DocumentLoaderParams,
>(config: {
	documentLoader: DocumentLoader<TDocMetadata, TParams>;
	chunker: ChunkerFunction;
	embedder: EmbedderFunction;
	chunkStore: ChunkStore<TChunkMetadata>;
	/**
	 * Function to extract document key from a document
	 * This is used to uniquely identify documents in the chunk store
	 */
	documentKey: (document: Document<TDocMetadata>) => string;
	/**
	 * Metadata transformation function to convert document metadata to chunk metadata
	 * Required when document metadata differs from chunk metadata
	 */
	metadataTransform?: (metadata: TDocMetadata) => TChunkMetadata;
	/**
	 * Pipeline options
	 */
	options?: {
		maxBatchSize?: number; // batch size for embedding (default: 100)
		maxRetries?: number; // number of retries (default: 3)
		retryDelay?: number; // retry interval in milliseconds (default: 1000)
		onProgress?: (progress: IngestProgress) => void;
		onError?: (error: IngestError) => void;
	};
}) {
	const {
		documentLoader,
		chunker,
		embedder,
		chunkStore,
		documentKey,
		metadataTransform,
		options = {},
	} = config;

	// Set default options
	const pipelineOptions = {
		maxBatchSize: options.maxBatchSize ?? 100,
		maxRetries: options.maxRetries ?? 3,
		retryDelay: options.retryDelay ?? 1000,
		onProgress: options.onProgress ?? (() => {}),
		onError: options.onError ?? (() => {}),
	};

	/**
	 * Run the ingestion pipeline
	 */
	return async function ingest(params: TParams): Promise<IngestResult> {
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
			// Collect documents into batches for more efficient processing
			const documentBatch: Array<Document<TDocMetadata>> = [];

			// Process documents in batches
			for await (const document of documentLoader.load(params)) {
				result.totalDocuments++;
				documentBatch.push(document);

				// Process batch when it reaches the configured size
				if (documentBatch.length >= pipelineOptions.maxBatchSize) {
					await processBatch(
						documentBatch,
						result,
						progress,
						config,
						pipelineOptions,
					);
					documentBatch.length = 0; // Clear the batch
				}
			}

			// Process any remaining documents in the final batch
			if (documentBatch.length > 0) {
				await processBatch(
					documentBatch,
					result,
					progress,
					config,
					pipelineOptions,
				);
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

/**
 * Process a batch of documents efficiently
 */
async function processBatch<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
	TParams extends DocumentLoaderParams,
>(
	documents: Array<Document<TDocMetadata>>,
	result: IngestResult,
	progress: IngestProgress,
	config: {
		documentLoader: DocumentLoader<TDocMetadata, TParams>;
		chunker: ChunkerFunction;
		embedder: EmbedderFunction;
		chunkStore: ChunkStore<TChunkMetadata>;
		documentKey: (document: Document<TDocMetadata>) => string;
		metadataTransform?: (metadata: TDocMetadata) => TChunkMetadata;
		options?: {
			maxBatchSize?: number;
			maxRetries?: number;
			retryDelay?: number;
			onProgress?: (progress: IngestProgress) => void;
			onError?: (error: IngestError) => void;
		};
	},
	options: Required<
		NonNullable<Parameters<typeof createIngestPipeline>[0]["options"]>
	>,
): Promise<void> {
	// Process documents sequentially within the batch
	for (const document of documents) {
		progress.currentDocument = config.documentKey(document);

		try {
			await processDocument(document, config, options);
			result.successfulDocuments++;
			progress.processedDocuments++;
		} catch (error) {
			result.failedDocuments++;
			progress.processedDocuments++;
			result.errors.push({
				document: progress.currentDocument,
				error: error instanceof Error ? error : new Error(String(error)),
			});
		}

		options.onProgress(progress);
	}
}

/**
 * Process a single document with retry logic
 */
async function processDocument<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
	TParams extends DocumentLoaderParams,
>(
	document: Document<TDocMetadata>,
	config: {
		documentLoader: DocumentLoader<TDocMetadata, TParams>;
		chunker: ChunkerFunction;
		embedder: EmbedderFunction;
		chunkStore: ChunkStore<TChunkMetadata>;
		documentKey: (document: Document<TDocMetadata>) => string;
		metadataTransform?: (metadata: TDocMetadata) => TChunkMetadata;
		options?: {
			maxBatchSize?: number;
			maxRetries?: number;
			retryDelay?: number;
			onProgress?: (progress: IngestProgress) => void;
			onError?: (error: IngestError) => void;
		};
	},
	options: Required<
		NonNullable<Parameters<typeof createIngestPipeline>[0]["options"]>
	>,
): Promise<void> {
	const { chunker, embedder, chunkStore, documentKey, metadataTransform } =
		config;
	const docKey = documentKey(document);

	// Apply metadata transformation
	const targetMetadata = metadataTransform
		? metadataTransform(document.metadata)
		: (document.metadata as unknown as TChunkMetadata);

	// Retry logic
	for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
		try {
			// Chunking
			const chunkTexts = chunker(document.content);

			// Batch embedding
			const chunks = [];
			for (let i = 0; i < chunkTexts.length; i += options.maxBatchSize) {
				const batch = chunkTexts.slice(i, i + options.maxBatchSize);
				const embeddings = await embedder.embedMany(batch);

				for (let j = 0; j < batch.length; j++) {
					chunks.push({
						content: batch[j],
						index: i + j,
						embedding: embeddings[j],
					});
				}
			}

			// Save with transformed metadata
			await chunkStore.insert(docKey, chunks, targetMetadata);
			return;
		} catch (error) {
			const isLastAttempt = attempt === options.maxRetries;

			options.onError({
				document: docKey,
				error: error instanceof Error ? error : new Error(String(error)),
				willRetry: !isLastAttempt,
				attemptNumber: attempt,
			});

			if (isLastAttempt) {
				throw error;
			}

			// Exponential backoff
			const delay = options.retryDelay * 2 ** (attempt - 1);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}
