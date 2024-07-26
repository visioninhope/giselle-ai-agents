import type { InvokeFunction } from "../type";
import { invoke as agent } from "./agents/invoke";
import { invoke as response } from "./response/invoke";
import { invoke as textGeneration } from "./text-generation/invoke";

/** @todo write document about naming convention */
export const invokes: Record<string, InvokeFunction> = {
	textGeneration,
	response,
	agent,
};
