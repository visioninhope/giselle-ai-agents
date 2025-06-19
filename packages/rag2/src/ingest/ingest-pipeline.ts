import type { ChunkStore } from "../chunk-store/types";
import { createDefaultChunker } from "../chunker";
import type { ChunkerFunction } from "../chunker/types";
import type {
	Document,
	DocumentLoader,
	DocumentLoaderParams,
} from "../document-loader/types";
import { createDefaultEmbedder } from "../embedder";
import type { EmbedderFunction } from "../embedder/types";
import { OperationError } from "../errors";
import type { IngestError, IngestProgress, IngestResult } from "./types";

export interface IngestPipelineOptions<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
> {
	// Required configuration
	documentLoader: DocumentLoader<TDocMetadata, DocumentLoaderParams>;
	chunkStore: ChunkStore<TChunkMetadata>;
	documentKey: (document: Document<TDocMetadata>) => string;
	metadataTransform: (metadata: TDocMetadata) => TChunkMetadata;

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

/**
 * IngestPipeline class - encapsulates all configuration and logic
 */
export class IngestPipeline<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
> {
	private readonly documentLoader: DocumentLoader<
		TDocMetadata,
		DocumentLoaderParams
	>;
	private readonly chunker: ChunkerFunction;
	private readonly embedder: EmbedderFunction;
	private readonly chunkStore: ChunkStore<TChunkMetadata>;
	private readonly documentKey: (document: Document<TDocMetadata>) => string;
	private readonly metadataTransform: (
		metadata: TDocMetadata,
	) => TChunkMetadata;

	// Options
	private readonly maxBatchSize: number;
	private readonly maxRetries: number;
	private readonly retryDelay: number;
	private readonly onProgress: (progress: IngestProgress) => void;
	private readonly onError: (error: IngestError) => void;

	constructor(options: IngestPipelineOptions<TDocMetadata, TChunkMetadata>) {
		// Required configuration
		this.documentLoader = options.documentLoader;
		this.chunkStore = options.chunkStore;
		this.documentKey = options.documentKey;
		this.metadataTransform = options.metadataTransform;

		// Processors with defaults
		this.chunker = options.chunker ?? createDefaultChunker();
		this.embedder = options.embedder ?? createDefaultEmbedder();

		// Settings with defaults
		this.maxBatchSize = options.maxBatchSize ?? DEFAULT_MAX_BATCH_SIZE;
		this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
		this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
		this.onProgress = options.onProgress ?? (() => {});
		this.onError = options.onError ?? (() => {});
	}

	/**
	 * Run the ingestion pipeline
	 */
	async ingest(params: DocumentLoaderParams) {
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
			const documentBatch: Array<Document<TDocMetadata>> = [];

			for await (const document of this.documentLoader.load(params)) {
				result.totalDocuments++;
				documentBatch.push(document);

				if (documentBatch.length >= this.maxBatchSize) {
					await this.processBatch(documentBatch, result, progress);
					documentBatch.length = 0;
				}
			}

			if (documentBatch.length > 0) {
				await this.processBatch(documentBatch, result, progress);
			}
		} catch (error) {
			throw OperationError.invalidOperation(
				"ingestion pipeline",
				"Failed to complete ingestion pipeline",
				{ cause: error instanceof Error ? error.message : String(error) },
			);
		}

		return result;
	}

	/**
	 * Process a batch of documents
	 */
	private async processBatch(
		documents: Array<Document<TDocMetadata>>,
		result: IngestResult,
		progress: IngestProgress,
	) {
		for (const document of documents) {
			const docKey = this.documentKey(document);
			progress.currentDocument = docKey;

			try {
				await this.processDocument(document, docKey);
				result.successfulDocuments++;
				progress.processedDocuments++;
			} catch (error) {
				result.failedDocuments++;
				progress.processedDocuments++;
				result.errors.push({
					document: docKey,
					error: error instanceof Error ? error : new Error(String(error)),
				});
			}

			this.onProgress(progress);
		}
	}

	/**
	 * Process a single document with retry logic
	 */
	private async processDocument(
		document: Document<TDocMetadata>,
		docKey: string,
	) {
		const targetMetadata = this.metadataTransform(document.metadata);

		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			try {
				const chunkTexts = this.chunker(document.content);
				const chunks = [];

				// Batch embedding to improve performance
				for (let i = 0; i < chunkTexts.length; i += this.maxBatchSize) {
					const batch = chunkTexts.slice(i, i + this.maxBatchSize);
					const embeddings = await this.embedder.embedMany(batch);

					for (let j = 0; j < batch.length; j++) {
						chunks.push({
							content: batch[j],
							index: i + j,
							embedding: embeddings[j],
						});
					}
				}

				await this.chunkStore.insert(docKey, chunks, targetMetadata);
				return;
			} catch (error) {
				const isLastAttempt = attempt === this.maxRetries;

				this.onError({
					document: docKey,
					error: error instanceof Error ? error : new Error(String(error)),
					willRetry: !isLastAttempt,
					attemptNumber: attempt,
				});

				if (isLastAttempt) {
					throw error;
				}

				// Exponential backoff
				const delay = this.retryDelay * 2 ** (attempt - 1);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}
}
