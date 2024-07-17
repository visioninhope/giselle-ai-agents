import invariant from "tiny-invariant";
import type { NodeClassName } from "./classes";
export { type NodeClassName, getNodeClass } from "./classes";
import type { NodeClass } from "./type";
export type { NodeClass } from "./type";
export * from "./contexts";

export const findNodeClass = (
	nodeClasses: NodeClass[],
	nodeClassName: NodeClassName,
) => {
	const nodeClass = nodeClasses.find(
		(nodeClass) => nodeClass.name === nodeClassName,
	);
	invariant(nodeClass != null, `missing nodeDef for ${nodeClassName}`);
	return nodeClass;
};
