import type { NodeClasses } from "../type";
import { agent } from "./agent";
import { onRequest } from "./on-request";
import { response } from "./response";
import { text } from "./text";

export const nodeClasses = {
	onRequest,
	agent,
	response,
	text,
} satisfies NodeClasses;
