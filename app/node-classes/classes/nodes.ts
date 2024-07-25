import type { NodeClass } from "../type";
import * as agent from "./agents/node";
import * as onRequest from "./on-request/node";
import * as response from "./response/node";
import * as textGeneration from "./text-generation/node";
import * as text from "./text/node";

export const nodeClasses = [
	onRequest,
	response,
	textGeneration,
	text,
	agent,
] satisfies NodeClass[];
export type NodeClassName = (typeof nodeClasses)[number]["name"];
export const getNodeClasses = () => JSON.parse(JSON.stringify(nodeClasses));
