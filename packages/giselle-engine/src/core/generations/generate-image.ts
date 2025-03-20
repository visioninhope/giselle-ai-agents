import { fal } from "@ai-sdk/fal";
import {
	type CompletedGeneration,
	type FileData,
	type GenerationOutput,
	type Image,
	type NodeId,
	type Output,
	type OutputId,
	type QueuedGeneration,
	type RunningGeneration,
	isImageGenerationNode,
} from "@giselle-sdk/data-type";
import {
	type Experimental_GeneratedImage as GeneratedImage,
	experimental_generateImage as generateImageAiSdk,
} from "ai";
import { filePath } from "../files/utils";
import type { GiselleEngineContext } from "../types";
import {
	buildMessageObject,
	getGeneration,
	getNodeGenerationIndexes,
	setGeneratedImage,
	setGeneration,
	setGenerationIndex,
	setNodeGenerationIndex,
} from "./utils";

export async function generateImage(args: {
	context: GiselleEngineContext;
	generation: QueuedGeneration;
}) {
	const actionNode = args.generation.context.actionNode;
	if (!isImageGenerationNode(actionNode)) {
		throw new Error("Invalid generation type");
	}
	const runningGeneration = {
		...args.generation,
		status: "running",
		messages: [],
		ququedAt: Date.now(),
		requestedAt: Date.now(),
		startedAt: Date.now(),
	} satisfies RunningGeneration;

	await Promise.all([
		setGeneration({
			storage: args.context.storage,
			generation: runningGeneration,
		}),
		setGenerationIndex({
			storage: args.context.storage,
			generationIndex: {
				id: runningGeneration.id,
				origin: runningGeneration.context.origin,
			},
		}),
		setNodeGenerationIndex({
			storage: args.context.storage,
			nodeId: runningGeneration.context.actionNode.id,
			origin: runningGeneration.context.origin,
			nodeGenerationIndex: {
				id: runningGeneration.id,
				nodeId: runningGeneration.context.actionNode.id,
				status: "running",
				createdAt: runningGeneration.createdAt,
				ququedAt: runningGeneration.ququedAt,
				requestedAt: runningGeneration.requestedAt,
				startedAt: runningGeneration.startedAt,
			},
		}),
	]);

	async function fileResolver(file: FileData) {
		const blob = await args.context.storage.getItemRaw(
			filePath({
				...runningGeneration.context.origin,
				fileId: file.id,
				fileName: file.name,
			}),
		);
		if (blob === undefined) {
			return undefined;
		}
		return blob;
	}

	async function generationContentResolver(nodeId: NodeId, outputId: OutputId) {
		const nodeGenerationIndexes = await getNodeGenerationIndexes({
			origin: runningGeneration.context.origin,
			storage: args.context.storage,
			nodeId,
		});
		if (
			nodeGenerationIndexes === undefined ||
			nodeGenerationIndexes.length === 0
		) {
			return undefined;
		}
		const generation = await getGeneration({
			...args,
			storage: args.context.storage,
			generationId: nodeGenerationIndexes[nodeGenerationIndexes.length - 1].id,
		});
		if (generation?.status !== "completed") {
			return undefined;
		}
		let output: Output | undefined;
		for (const sourceNode of runningGeneration.context.sourceNodes) {
			for (const sourceOutput of sourceNode.outputs) {
				if (sourceOutput.id === outputId) {
					output = sourceOutput;
					break;
				}
			}
		}
		if (output === undefined) {
			return undefined;
		}
		const generationOutput = generation.outputs.find(
			(output) => output.outputId === outputId,
		);
		if (generationOutput === undefined) {
			return undefined;
		}
		switch (generationOutput.type) {
			case "source":
				return JSON.stringify(generationOutput.sources);
			case "reasoning":
				throw new Error("Generation output type is not supported");
			case "generated-image":
				throw new Error("Generation output type is not supported");
			case "generated-text":
				return generationOutput.content;
			default: {
				const _exhaustiveCheck: never = generationOutput;
				throw new Error(
					`Unhandled generation output type: ${_exhaustiveCheck}`,
				);
			}
		}
	}
	const messages = await buildMessageObject(
		actionNode,
		runningGeneration.context.sourceNodes,
		fileResolver,
		generationContentResolver,
	);
	let prompt = "";
	for (const message of messages) {
		prompt += message?.content ?? "";
	}
	const result = await generateImageAiSdk({
		model: fal.image(actionNode.content.llm.id),
		prompt,
		size: actionNode.content.llm.configurations.size,
		n: actionNode.content.llm.configurations.n,
	});

	const generationOutputs: GenerationOutput[] = [];

	const generatedImageOutput =
		runningGeneration.context.actionNode.outputs.find(
			(output) => output.accesor === "generated-image",
		);
	if (generatedImageOutput !== undefined) {
		const contents = await Promise.all(
			result.images.map(async (image) => {
				const imageType = detectImageType(image);
				if (imageType === null) {
					return null;
				}
				const filename = `image_${Date.now()}.${imageType.ext}`;
				await setGeneratedImage({
					storage: args.context.storage,
					generation: runningGeneration,
					generatedImage: image,
					generatedImageFilename: filename,
				});
				return {
					contentType: imageType.contentType,
					filename,
					pathname: `/generations/${runningGeneration.id}/${filename}`,
				} satisfies Image;
			}),
		).then((results) => results.filter((result) => result !== null));

		generationOutputs.push({
			type: "generated-image",
			contents,
			outputId: generatedImageOutput.id,
		});
	}
	const completedGeneration = {
		...args.generation,
		status: "completed",
		messages: [],
		ququedAt: Date.now(),
		requestedAt: Date.now(),
		startedAt: Date.now(),
		completedAt: Date.now(),
		outputs: generationOutputs,
	} satisfies CompletedGeneration;

	await Promise.all([
		setGeneration({
			storage: args.context.storage,
			generation: completedGeneration,
		}),
		setNodeGenerationIndex({
			storage: args.context.storage,
			nodeId: runningGeneration.context.actionNode.id,
			origin: runningGeneration.context.origin,
			nodeGenerationIndex: {
				id: completedGeneration.id,
				nodeId: completedGeneration.context.actionNode.id,
				status: "completed",
				createdAt: completedGeneration.createdAt,
				ququedAt: completedGeneration.ququedAt,
				requestedAt: completedGeneration.requestedAt,
				startedAt: completedGeneration.startedAt,
				completedAt: completedGeneration.completedAt,
			},
		}),
	]);
}

/**
 * Detects if a file is JPEG, PNG, or WebP by examining its header bytes
 * @param file The file to check
 * @returns Detected MIME type or null if not recognized
 */
function detectImageType(generatedImage: GeneratedImage) {
	// Get the first 12 bytes of the file (enough for all our formats)
	const bytes = generatedImage.uint8Array;

	// JPEG: Starts with FF D8 FF
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return { contentType: "image/jpeg", ext: "jpeg" };
	}

	// PNG: Starts with 89 50 4E 47 0D 0A 1A 0A (hex for \x89PNG\r\n\x1a\n)
	if (
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return { contentType: "image/png", ext: "png" };
	}

	// WebP: Starts with RIFF....WEBP (52 49 46 46 ... 57 45 42 50)
	if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return { contentType: "image/webp", ext: "webp" };
	}

	// Not a recognized image format
	return null;
}
