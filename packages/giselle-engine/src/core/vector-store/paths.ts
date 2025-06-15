import type { VectorStoreId } from "./object";

export function vectorStorePath(vectorStoreId: VectorStoreId) {
	return `vectorStores/${vectorStoreId}/object.json`;
}
