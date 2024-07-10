import invariant from "tiny-invariant";
import * as findUser from "./findUser";
import type { NodeDef } from "./type";

export const nodeDefs = [findUser] satisfies NodeDef[];
export type NodeType = (typeof nodeDefs)[number]["key"];
export const getNodeDef = (type: NodeType): NodeDef => {
	const nodeDef = nodeDefs.find((def) => def.key === type);
	invariant(nodeDef != null, "missing nodeDef");
	return nodeDef;
};
