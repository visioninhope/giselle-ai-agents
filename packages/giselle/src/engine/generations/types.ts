import type { ToolSet } from "ai";

export type PreparedToolSet = {
	toolSet: ToolSet;
	cleanupFunctions: Array<() => void | Promise<void>>;
};
