import type { NodeClasses } from "../type";
import { agent } from "./agent";
import { onRequest } from "./on-request";
import { response } from "./response";

export const nodeClasses = {
	onRequest,
	agent,
	response,
} satisfies NodeClasses;
