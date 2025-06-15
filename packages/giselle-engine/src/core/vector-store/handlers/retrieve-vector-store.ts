import type { GiselleEngineContext } from "../../types";
import { InternalVectorStoreObject, type VectorStoreId } from "../object";
import { vectorStorePath } from "../paths";

export async function retrieveVectorStore(args: {
	context: GiselleEngineContext;
	vectorStoreId: VectorStoreId;
}) {
	const vectorStore = args.context.vectorStore;
	if (vectorStore === undefined) {
		throw new Error("VectorStore is not initialized");
	}
	return await vectorStore.retrieve({
		vectorStoreId: args.vectorStoreId,
	});
}
