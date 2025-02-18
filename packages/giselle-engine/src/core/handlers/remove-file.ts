import type { z } from "zod";
import { filePath } from "../helpers/workspace-path";
import { removeFile } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = removeFile.Input;
type Input = z.infer<typeof Input>;
export async function removeFileHandler({
	context,
	unsafeInput,
}: GiselleEngineHandlerArgs<Input>) {
	const input = Input.parse(unsafeInput);
	await context.storage.removeItem(
		filePath({
			type: "workspace",
			id: input.workspaceId,
			fileId: input.uploadedFile.id,
			fileName: input.uploadedFile.name,
		}),
	);
	// const workspace = await getWorkspace({
	// 	storage: context.storage,
	// 	workspaceId: input.workspaceId,
	// });
	// if (workspace.providerOptions?.openai?.vectorStore.status === "created") {
	// 	await openai.beta.vectorStores.files.delete(
	// 		input.uploadedFile.openAi.fileId,
	// 		{
	// 			vector_store_id: workspace.providerOptions.openai.vectorStore.id,
	// 		},
	// 	);
	// }
	// await openai.files.delete(input.uploadedFile.openAi.fileId);
}
