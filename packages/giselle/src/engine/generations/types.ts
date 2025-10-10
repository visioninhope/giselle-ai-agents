import type { ToolSet } from "ai";

export type PreparedToolSet = {
	toolSet: ToolSet;
	cleanupFunctions: Array<() => void | Promise<void>>;
};
export interface GenerationMetadata {
	[key: string]: string | number | GenerationMetadata | null | undefined;
}
