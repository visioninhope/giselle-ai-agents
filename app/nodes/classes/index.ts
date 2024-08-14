import type { NodeClasses } from "../type";
import { agent } from "./agent";
import { onRequest } from "./on-request";
import { response } from "./response";
import { text } from "./text";
import { textGeneration } from "./text-generation";

export const nodeClasses = {
	onRequest,
	agent,
	response,
	text,
	textGeneration,
} satisfies NodeClasses;
