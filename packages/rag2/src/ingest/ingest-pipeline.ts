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

export interface IngestPipelineConfig<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
	TParams extends DocumentLoaderParams = DocumentLoaderParams,
> {
	documentLoader: DocumentLoader<TDocMetadata, TParams>;
	chunker?: ChunkerFunction;
	embedder?: EmbedderFunction;
	chunkStore: ChunkStore<TChunkMetadata>;
	documentKey: (document: Document<TDocMetadata>) => string;
	metadataTransform?: (metadata: TDocMetadata) => TChunkMetadata;
}

export interface IngestPipelineOptions {
	maxBatchSize?: number;
	maxRetries?: number;
	retryDelay?: number;
	onProgress?: (progress: IngestProgress) => void;
	onError?: (error: IngestError) => void;
}

/**
 * IngestPipeline class - encapsulates all configuration and logic
 */
export class IngestPipeline<
	TDocMetadata extends Record<string, unknown>,
	TChunkMetadata extends Record<string, unknown>,
	TParams extends DocumentLoaderParams = DocumentLoaderParams,
> {
	private readonly documentLoader: DocumentLoader<TDocMetadata, TParams>;
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

	constructor(
		config: IngestPipelineConfig<TDocMetadata, TChunkMetadata, TParams>,
		options: IngestPipelineOptions = {},
	) {
		this.documentLoader = config.documentLoader;
		this.chunker = config.chunker ?? createDefaultChunker();
		this.embedder = config.embedder ?? createDefaultEmbedder();
		this.chunkStore = config.chunkStore;
		this.documentKey = config.documentKey;
		this.metadataTransform =
			config.metadataTransform ??
			((metadata) => metadata as unknown as TChunkMetadata);

		this.maxBatchSize = options.maxBatchSize ?? 100;
		this.maxRetries = options.maxRetries ?? 3;
		this.retryDelay = options.retryDelay ?? 1000;
		this.onProgress = options.onProgress ?? (() => {});
		this.onError = options.onError ?? (() => {});
	}

	/**
	 * Run the ingestion pipeline
	 */
	async ingest(params: TParams): Promise<IngestResult> {
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
	): Promise<void> {
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
	): Promise<void> {
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
