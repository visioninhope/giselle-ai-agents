import type { GiselleEngineContext } from "../types";
import type { VectorStoreId } from "./types/object";

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
