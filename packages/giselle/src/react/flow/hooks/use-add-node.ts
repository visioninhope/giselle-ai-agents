import type { NodeLike, NodeUIState } from "@giselle-sdk/data-type";
import { useCallback } from "react";
import type { WorkspaceAction } from "./use-workspace-reducer";

export function useAddNode(dispatch: React.Dispatch<WorkspaceAction>) {
	return useCallback(
		(node: NodeLike, options?: { ui?: NodeUIState }) => {
			dispatch({
				type: "ADD_NODE",
				node: node as NodeLike,
				ui: options?.ui,
			});
		},
		[dispatch],
	);
}
