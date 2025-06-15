import type { GiselleEngineContext } from "../../types";
import { InternalVectorStoreObject } from "../object";
import { vectorStorePath } from "../paths";

export async function createVectorStore(args: {
	context: GiselleEngineContext;
}) {
	const vectorStore = args.context.vectorStore;
	if (vectorStore === undefined) {
		throw new Error("VectorStore is not initialized");
	}
	const vectorStoreObject = await vectorStore.create();
	await args.context.storage.setItem(
		vectorStorePath(vectorStoreObject.id),
		InternalVectorStoreObject.parse(vectorStoreObject),
	);
}
