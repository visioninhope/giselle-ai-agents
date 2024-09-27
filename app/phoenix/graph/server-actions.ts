"use server";

import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText as sdkStreamText } from "ai";
import { createStreamableValue } from "ai/rsc";

export async function streamText(messages: CoreMessage[]) {
	const result = await sdkStreamText({
		model: openai("gpt-4-turbo"),
		messages,
	});

	const stream = createStreamableValue(result.textStream);
	return stream.value;
}
