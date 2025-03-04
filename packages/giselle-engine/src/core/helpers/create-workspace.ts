import { generateInitialWorkspace } from "@giselle-sdk/data-type";

export async function createWorkspace() {
	const workspace = generateInitialWorkspace();
	return { ...workspace };
}
