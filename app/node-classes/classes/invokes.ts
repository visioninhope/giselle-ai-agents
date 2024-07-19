import type { InvokeFunction } from "../type";
import { invoke as textGeneration } from "./text-generation/invoke";

export const invokes: Record<string, InvokeFunction> = {
	textGeneration,
};
