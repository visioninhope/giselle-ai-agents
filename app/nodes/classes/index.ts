import type { NodeClasses } from "../type";
import { agent } from "./agent";
import { knowledgeRetrieval } from "./knowledge-retrieval";
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
	knowledgeRetrieval,
} satisfies NodeClasses;
