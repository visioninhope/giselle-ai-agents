import invariant from "tiny-invariant";
import type { InvokeFunction, NodeClass } from "../type";
// import { invokes } from "./invokes";
import { type NodeClassName, nodeClasses } from "./nodes";

export const getNodeClass = (className: NodeClassName): NodeClass => {
	const nodeClass = nodeClasses.find(
		(nodeClass) => nodeClass.name === className,
	);
	invariant(nodeClass != null, "missing nodeDef");
	return nodeClass;
};

// export const getInvokeFunction = (
// 	invokeFunctionKey: string,
// ): InvokeFunction | undefined | null => {
// 	return invokes[invokeFunctionKey];
// };
