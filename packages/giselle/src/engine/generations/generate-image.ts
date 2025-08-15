import { fal } from "@ai-sdk/fal";
import { openai } from "@ai-sdk/openai";
import {
	type ImageGenerationNode,
	isImageGenerationNode,
	type OpenAIImageLanguageModelData,
} from "@giselle-sdk/data-type";
import type { GeneratedImageData } from "@giselle-sdk/language-model";
import {
	experimental_generateImage as generateImageAiSdk,
	type ModelMessage,
} from "ai";
import {
	type GenerationContext,
	type GenerationOutput,
	type Image,
	ImageId,
	type QueuedGeneration,
	type RunningGeneration,
} from "../../concepts/generation";
import type { GiselleEngineContext } from "../types";
import { useGenerationExecutor } from "./internal/use-generation-executor";
import type { TelemetrySettings } from "./types";
import {
	buildMessageObject,
	detectImageType,
	setGeneratedImage,
} from "./utils";

export function generateImage(args: {
	context: GiselleEngineContext;
	generation: QueuedGeneration;
	telemetry?: TelemetrySettings;
	useExperimentalStorage: boolean;
}) {
	return useGenerationExecutor({
		context: args.context,
		generation: args.generation,
		telemetry: args.telemetry,
		useExperimentalStorage: args.useExperimentalStorage,
		execute: async ({
			runningGeneration,
			generationContext,
			fileResolver,
			generationContentResolver,
			completeGeneration,
		}) => {
			const operationNode = generationContext.operationNode;
			if (!isImageGenerationNode(operationNode)) {
				throw new Error("Invalid generation type");
			}

			const messages = await buildMessageObject(
				operationNode,
				generationContext.sourceNodes,
				fileResolver,
				generationContentResolver,
			);

			let generationOutputs: GenerationOutput[] = [];
			switch (operationNode.content.llm.provider) {
				case "fal":
					generationOutputs = await generateImageWithFal({
						operationNode,
						messages,
						runningGeneration,
						generationContext,
						context: args.context,
					});
					break;
				case "openai":
					generationOutputs = await generateImageWithOpenAI({
						messages,
						runningGeneration,
						generationContext,
						languageModelData: operationNode.content.llm,
						context: args.context,
					});
					break;
				default: {
					const _exhaustiveCheck: never = operationNode.content.llm;
					throw new Error(
						`Unhandled generation output type: ${_exhaustiveCheck}`,
					);
				}
			}

			await completeGeneration({
				inputMessages: messages,
				outputs: generationOutputs,
			});
		},
	});
}

async function generateImageWithFal({
	operationNode,
	generationContext,
	runningGeneration,
	messages,
	context,
	useExperimentalStorage,
}: {
	operationNode: ImageGenerationNode;
	generationContext: GenerationContext;
	runningGeneration: RunningGeneration;
	messages: ModelMessage[];
	context: GiselleEngineContext;
	useExperimentalStorage?: boolean;
}) {
	let prompt = "";
	for (const message of messages) {
		if (!Array.isArray(message.content)) {
			continue;
		}
		for (const content of message.content) {
			if (content.type !== "text") {
				continue;
			}
			prompt += content.text;
		}
	}

	const result = await generateImageAiSdk({
		model: fal.image(operationNode.content.llm.id),
		prompt,
		n: operationNode.content.llm.configurations.n,
		size: operationNode.content.llm.configurations.size,
	});

	const generationOutputs: GenerationOutput[] = [];

	const generatedImageOutput = generationContext.operationNode.outputs.find(
		(output) => output.accessor === "generated-image",
	);
	if (generatedImageOutput !== undefined) {
		const contents = await Promise.all(
			result.images.map(async (image) => {
				const imageType = detectImageType(image.uint8Array);
				if (imageType === null) {
					return null;
				}
				const id = ImageId.generate();
				const filename = `${id}.${imageType.ext}`;

				await setGeneratedImage({
					storage: context.storage,
					experimental_storage: context.experimental_storage,
					useExperimentalStorage,
					generation: runningGeneration,
					generatedImage: {
						uint8Array: image.uint8Array,
						base64: image.base64,
					} satisfies GeneratedImageData,
					generatedImageFilename: filename,
				});

				return {
					id,
					contentType: imageType.contentType,
					filename,
					pathname: `/generations/${runningGeneration.id}/generated-images/${filename}`,
				} satisfies Image;
			}),
		).then((results) => results.filter((result) => result !== null));

		generationOutputs.push({
			type: "generated-image",
			contents,
			outputId: generatedImageOutput.id,
		});
	}

	return generationOutputs;
}

async function generateImageWithOpenAI({
	messages,
	generationContext,
	runningGeneration,
	languageModelData,
	context,
	useExperimentalStorage,
}: {
	messages: ModelMessage[];
	generationContext: GenerationContext;
	runningGeneration: RunningGeneration;
	languageModelData: OpenAIImageLanguageModelData;
	context: GiselleEngineContext;
	useExperimentalStorage?: boolean;
}) {
	let prompt = "";
	for (const message of messages) {
		if (!Array.isArray(message.content)) {
			continue;
		}
		for (const content of message.content) {
			if (content.type !== "text") {
				continue;
			}
			prompt += content.text;
		}
	}
	const { images } = await generateImageAiSdk({
		model: openai.image("gpt-image-1"),
		prompt,
		n: languageModelData.configurations.n,
		size: languageModelData.configurations.size,
		providerOptions: {
			openai: {
				...languageModelData.configurations,
			},
		},
	});
	const generationOutputs: GenerationOutput[] = [];

	const generatedImageOutput = generationContext.operationNode.outputs.find(
		(output) => output.accessor === "generated-image",
	);
	if (generatedImageOutput !== undefined) {
		const contents = await Promise.all(
			images.map(async (image) => {
				const imageType = detectImageType(image.uint8Array);
				if (imageType === null) {
					return null;
				}
				const id = ImageId.generate();
				const filename = `${id}.${imageType.ext}`;

				await setGeneratedImage({
					storage: context.storage,
					experimental_storage: context.experimental_storage,
					useExperimentalStorage,
					generation: runningGeneration,
					generatedImage: {
						uint8Array: image.uint8Array,
						base64: image.base64,
					} satisfies GeneratedImageData,
					generatedImageFilename: filename,
				});

				return {
					id,
					contentType: imageType.contentType,
					filename,
					pathname: `/generations/${runningGeneration.id}/generated-images/${filename}`,
				} satisfies Image;
			}),
		).then((results) => results.filter((result) => result !== null));

		generationOutputs.push({
			type: "generated-image",
			contents,
			outputId: generatedImageOutput.id,
		});
	}

	return generationOutputs;
}
