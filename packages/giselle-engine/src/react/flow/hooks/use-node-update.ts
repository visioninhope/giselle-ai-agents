import type { NodeBase, Workspace } from "@giselle-sdk/data-type";
import { useCallback } from "react";

export function useNodeUpdate(
	setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>,
) {
	return useCallback(
		<T extends NodeBase>(node: T, data: Partial<T>) => {
			setWorkspace((ws) => ({
				...ws,
				nodes: ws.nodes.map((n) => (n.id === node.id ? { ...n, ...data } : n)),
			}));
		},
		[setWorkspace],
	);
}
