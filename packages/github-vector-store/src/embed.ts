import { openai } from "@ai-sdk/openai";
import { embed as embedCore } from "ai";

/**
 * Embed a text using OpenAI's embedding model
 * @param text - The text to embed
 * @returns The embedded text as an array of numbers
 */
export async function embed(text: string): Promise<number[]> {
	const { embedding } = await embedCore({
		model: openai.embedding("text-embedding-3-small"),
		value: text,
		// we use default value (=2) for maxRetries
		// https://ai-sdk.dev/docs/ai-sdk-core/embeddings#retries
		// maxRetries: 2,
	});
	return embedding;
}
