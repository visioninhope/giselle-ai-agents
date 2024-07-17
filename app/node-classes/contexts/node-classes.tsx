"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
} from "react";
import { useNodeClasses as useNodeClassesData } from "../get-node-classes";
import type { NodeClass } from "../type";

const NodeClassesInternal = createContext<NodeClass[] | null>(null);

export const NodeClassesProvider: FC<PropsWithChildren> = ({ children }) => {
	const { nodeClasses } = useNodeClassesData();

	if (nodeClasses == null) {
		return null;
	}
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
