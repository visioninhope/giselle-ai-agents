import type { Node, NodeUIState, Workspace } from "@giselle-sdk/data-type";
import { useCallback } from "react";

export function useAddNode(
	setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>,
) {
	return useCallback(
		(node: Node, options?: { ui?: NodeUIState }) => {
			setWorkspace((ws) => {
				const ui = { ...ws.ui, nodeState: { ...ws.ui.nodeState } };
				if (options?.ui) {
					ui.nodeState[node.id] = options.ui;
				}
				return { ...ws, nodes: [...ws.nodes, node], ui };
			});
		},
		[setWorkspace],
	);
}
