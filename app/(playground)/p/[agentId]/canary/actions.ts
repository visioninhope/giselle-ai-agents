"use server";

import { openai } from "@ai-sdk/openai";
import { toJsonSchema } from "@valibot/to-json-schema";
import { jsonSchema, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import * as v from "valibot";
import type { TextArtifactObject } from "./types";

const artifactSchema = v.object({
	plan: v.pipe(
		v.string(),
		v.description(
			"How you think about the content of the artefact (purpose, structure, essentials) and how you intend to output it",
		),
	),
	title: v.pipe(v.string(), v.description("The title of the artefact")),
	content: v.pipe(
		v.string(),
		v.description("The content of the artefact formatted markdown."),
	),
	description: v.pipe(
		v.string(),
		v.description(
			"Explanation of the Artifact and what the intention was in creating this Artifact. Add any suggestions for making it even better.",
		),
	),
});

export async function generateTextArtifactStream() {
	const stream = createStreamableValue<TextArtifactObject>();
	(async () => {
		const { partialObjectStream } = await streamObject({
			model: openai("gpt-4o-mini"),
			prompt: "Generate an answer to a question.",
			schema: jsonSchema<v.InferInput<typeof artifactSchema>>(
				toJsonSchema(artifactSchema),
			),
		});

		for await (const partialObject of partialObjectStream) {
			stream.update({
				type: "text",
				title: partialObject.title ?? "",
				content: partialObject.content ?? "",
				messages: {
					plan: partialObject.plan ?? "",
					description: partialObject.description ?? "",
				},
			});
		}
		stream.done();
	})();
	return stream.value;
}
