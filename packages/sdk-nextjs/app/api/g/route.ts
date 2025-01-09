import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
export async function POST() {
	const stream = streamText({
		model: openai("gpt-4o"),
		prompt: "hello",
	});
	return stream.toDataStreamResponse();
}
