import invariant from "tiny-invariant";
import type { AgentNodeClass, NodeClass } from "../type";
import * as agent from "./agent";
import * as onRequest from "./on-request";
import * as response from "./response";
import * as text from "./text";
import * as textGeneration from "./text-generation";
export * from "../type";

export const nodeClasses = [
	onRequest,
	response,
	textGeneration,
	text,
	agent,
] satisfies NodeClass[];

export type NodeClassName = (typeof nodeClasses)[number]["name"];

type GetNodeClassArgs = {
	name: string;
};
export const getNodeClass = (args: GetNodeClassArgs) => {
	const nodeClass = nodeClasses.find(
		(nodeClass) => nodeClass.name === args.name,
	);
	invariant(nodeClass != null, `Node class not found: ${args.name}`);
	return nodeClass;
};

export * as onRequest from "./on-request";
export * as response from "./response";
export * as textGeneration from "./text-generation";
export * as text from "./text";
export * as agent from "./agent";
