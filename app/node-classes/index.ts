import invariant from "tiny-invariant";
export * from "./classes";
import type { NodeClass } from "./type";
export type * from "./type";
export * from "./contexts";

export const findNodeClass = (
	nodeClasses: NodeClass[],
	nodeClassName: string,
) => {
	const nodeClass = nodeClasses.find(
		(nodeClass) => nodeClass.name === nodeClassName,
	);
	invariant(nodeClass != null, `missing nodeDef for ${nodeClassName}`);
	return nodeClass;
};
