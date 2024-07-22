"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
} from "react";
import type { NodeClass } from "../type";

const NodeClassesInternal = createContext<NodeClass[] | null>(null);

type NodeClassesProviderProps = {
	nodeClasses: NodeClass[];
};
export const NodeClassesProvider: FC<
	PropsWithChildren<NodeClassesProviderProps>
> = ({ nodeClasses, children }) => {
	return (
		<NodeClassesInternal.Provider value={nodeClasses}>
			{children}
		</NodeClassesInternal.Provider>
	);
};

export const useNodeClasses = () => {
	const nodeClasses = useContext(NodeClassesInternal);
	if (nodeClasses == null) {
		throw new Error("useNodeClasses must be used within a NodeClassesProvider");
	}
	return nodeClasses;
};
