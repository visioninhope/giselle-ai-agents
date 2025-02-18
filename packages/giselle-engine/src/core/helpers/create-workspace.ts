import {
	type LLMProvider,
	type WorkspaceId,
	generateInitialWorkspace,
} from "@giselle-sdk/data-type";
// import { openai } from "../../openai";

export async function createWorkspace() {
	const workspace = generateInitialWorkspace();
	// if (llmProviders.includes("openai")) {
	// 	const vectorStore = await createVectorStore(workspace.id);
	// 	openai = {
	// 		vectorStore: {
	// 			status: "created",
	// 			id: vectorStore.id,
	// 		},
	// 	};
	// }
	return { ...workspace };
}

// async function createVectorStore(workspaceId: WorkspaceId) {
// 	return await openai.beta.vectorStores.create({
// 		name: workspaceId,
// 		expires_after: {
// 			anchor: "last_active_at",
// 			days: 1,
// 		},
// 		metadata: {
// 			workspaceId,
// 		},
// 	});
// }
