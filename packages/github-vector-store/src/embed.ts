import { openai } from "@ai-sdk/openai";
import { embedMany as embedManyCore } from "ai";

export async function embedMany(chunks: string[]): Promise<number[][]> {
	const { embeddings } = await embedManyCore({
		model: openai.embedding("text-embedding-3-small"),
		values: chunks,
		// we use default value (=2) for maxRetries
		// https://ai-sdk.dev/docs/ai-sdk-core/embeddings#retries
		// maxRetries: 2,
	});
	return embeddings;
}
