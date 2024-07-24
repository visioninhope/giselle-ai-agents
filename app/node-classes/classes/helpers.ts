import invariant from "tiny-invariant";
import type { InvokeFunction, NodeClass, Resolver } from "../type";
import { invokes } from "./invokes";
import { type NodeClassName, nodeClasses } from "./nodes";
import { resolvers } from "./resolvers";

export const getNodeClass = (className: NodeClassName): NodeClass => {
	const nodeClass = nodeClasses.find(
		(nodeClass) => nodeClass.name === className,
	);
	invariant(nodeClass != null, "missing nodeDef");
	return nodeClass;
};

export const getInvokeFunction = (
	invokeFunctionKey: string,
): InvokeFunction | undefined | null => {
	return invokes[invokeFunctionKey];
};

export const getResolver = (
	resolverKey: string,
): Resolver | undefined | null => {
	return resolvers[resolverKey];
};
