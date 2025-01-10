import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const Input = z.object({
	prompt: z.string(),
});
type Input = z.infer<typeof Input>;

export async function textGeneration(unsafeInput: unknown) {
	const input = Input.parse(unsafeInput);
	const stream = streamText({
		model: openai("gpt-4o"),
		prompt: input.prompt,
	});
	return stream.toDataStreamResponse();
}
