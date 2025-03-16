import type { ProviderMetadata } from "ai";
import { z } from "zod";

export const OutputBase = z.object({
	type: z.string(),
});

export const GeneratedTextOutputType = z.literal("generated-text");
export const GeneratedTextContentOutput = OutputBase.extend({
	type: GeneratedTextOutputType,
	content: z.string(),
});

export const Image = z.object({
	url: z.string().url(),
});

export const GeneratedImageOuputType = z.literal("generated-image");
export const GeneratedImageContentOutput = OutputBase.extend({
	type: GeneratedImageOuputType,
	contents: Image.array(),
});

export const ReasoningOutput = z.object({
	type: z.literal("reasoning"),
	content: z.string(),
});

export interface UrlSource {
	sourceType: "url";
	id: string;
	url: string;
	providerMetadata?: ProviderMetadata;
}
export const UrlSource = z.object({
	sourceType: z.literal("url"),
	id: z.string(),
	url: z.string().url(),
	providerMetadata: z.custom<ProviderMetadata>().optional(),
}) as z.ZodType<UrlSource>;

export const Source = UrlSource;

export const SourceOutput = z.object({
	type: z.literal("source"),
	sources: z.array(Source),
});

export const GenerationOutput = z.discriminatedUnion("type", [
	GeneratedTextContentOutput,
	GeneratedImageContentOutput,
	ReasoningOutput,
	SourceOutput,
]);
export type GenerationOutput = z.infer<typeof GenerationOutput>;
