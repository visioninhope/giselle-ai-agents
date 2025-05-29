import { OpenAIEmbedder } from "./embed";
import type {
	MetadataType,
	QueryFunction,
	QueryFunctionParams,
	RecordValue,
} from "./types";

/**
 * Parameters for the main query function in packages/rag.
 */
type QueryParams<M extends MetadataType, F = Record<string, RecordValue>> = {
	question: string;
	limit: number;
	filters: F;
	similarityThreshold?: number;
	queryFunction: QueryFunction<M, F>;
};

export async function query<
	M extends MetadataType,
	F = Record<string, RecordValue>,
>(params: QueryParams<M, F>) {
	const {
		question,
		limit,
		filters,
		similarityThreshold = 0.5,
		queryFunction,
	} = params;

	// Improved input validation
	if (question.trim().length === 0) {
		throw new Error("Question cannot be empty or only whitespace");
	}

	if (limit <= 0) {
		throw new Error("Limit must be greater than 0");
	}

	if (similarityThreshold < 0 || similarityThreshold > 1) {
		throw new Error("Similarity threshold must be between 0 and 1");
	}

	try {
		const embedder = new OpenAIEmbedder();
		const qEmbedding = await embedder.embed(question.trim());

		const queryFunctionArgs: QueryFunctionParams<F> = {
			embedding: qEmbedding,
			limit,
			filters,
			similarityThreshold,
		};

		return await queryFunction(queryFunctionArgs);
	} catch (error) {
		throw new Error(
			`Query execution failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
