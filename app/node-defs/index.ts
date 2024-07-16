import invariant from "tiny-invariant";
import * as findUser from "./find-user";
import * as onRequest from "./on-request";
import * as sendMail from "./send-mail";
import type { NodeDef } from "./type";
export type { NodeDef } from "./type";
export * from "./use-node-defs";

export const nodeDefs = [findUser, sendMail, onRequest] satisfies NodeDef[];
export type NodeType = (typeof nodeDefs)[number]["key"];
export const getNodeDef = (type: NodeType): NodeDef => {
	const nodeDef = nodeDefs.find((def) => def.key === type);
	invariant(nodeDef != null, "missing nodeDef");
	return nodeDef;
};

export const findNodeDef = (nodeDefs: NodeDef[], nodeType: NodeType) => {
	const nodeDef = nodeDefs.find((def) => def.key === nodeType);
	invariant(nodeDef != null, `missing nodeDef for ${nodeType}`);
	return nodeDef;
};
