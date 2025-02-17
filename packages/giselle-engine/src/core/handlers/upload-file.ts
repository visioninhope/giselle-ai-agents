import { anthropic } from "@ai-sdk/anthropic";
import { type DataContent, generateObject } from "ai";
import { z } from "zod";
import { openai } from "../../openai";
import { getWorkspace } from "../helpers";
import { filePath } from "../helpers/workspace-path";
import { uploadFile } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = uploadFile.Input;
type Input = z.infer<typeof Input>;
const Output = uploadFile.Output;
type Output = z.infer<typeof Output>;

async function uploadToOpenAI(fileBlob: File, openAiVectorStoreId: string) {
	const file = await openai.files.create({
		file: fileBlob,
		purpose: "assistants",
	});
	const vectorStoreFile = await openai.beta.vectorStores.files.createAndPoll(
		openAiVectorStoreId,
		{
			file_id: file.id,
		},
		{
			headers: {
				"OpenAI-Beta": "assistants=v2",
			},
		},
	);
	return {
		fileId: file.id,
		vectorStoreFileId: vectorStoreFile.id,
	};
}
export async function generateTitle(data: DataContent) {
	const result = await generateObject({
		model: anthropic("claude-3-5-sonnet-20241022"),
		schema: z.object({
			title: z.string(),
		}),
		messages: [
			{
				role: "user",
				content: [
					{
						type: "file",
						data,
						mimeType: "application/pdf",
					},
					{
						type: "text",
						text: "Generate a unique title for the pdf.",
					},
				],
			},
		],
	});
	return result.object.title;
}
export async function uploadFileHandler({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>): Promise<Output> {
	const input = Input.parse(unsafeInput);

	const workspace = await getWorkspace({
		storage: context.storage,
		workspaceId: input.workspaceId,
	});
	// if (
	// 	workspace.providerOptions?.openai == null ||
	// 	workspace.providerOptions.openai.vectorStore.status !== "created"
	// ) {
	// 	throw new Error("OpenAI not enabled");
	// }
	// const openaiVectorStoreId = workspace.providerOptions.openai.vectorStore.id;
	const fileBuffer = await fileToBuffer(input.file);
	await context.storage.setItemRaw(
		filePath({
			type: "workspace",
			id: input.workspaceId,
			fileId: input.fileId,
			fileName: input.fileName,
		}),
		fileBuffer,
	);

	const [generatedTitle] = await Promise.all([
		// uploadToOpenAI(input.file, openaiVectorStoreId),
		generateTitle(fileBuffer),
	]);
	return {
		generatedTitle,
	};
}

async function fileToBuffer(file: File): Promise<Buffer> {
	return file.arrayBuffer().then((buffer) => Buffer.from(buffer));
}
