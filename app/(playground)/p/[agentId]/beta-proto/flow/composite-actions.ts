import type { GiselleNode } from "../giselle-node/types";
import type { ThunkAction } from "../graph/context";
import { playgroundModes } from "../graph/types";
import { updateMode } from "../graph/v2/mode";
import { setFlow } from "./action";

export function runFlow(finalNode: GiselleNode): ThunkAction {
	return async (dispatch, getState) => {
		const state = getState();
		dispatch(
			setFlow({
				input: {
					finalNodeId: finalNode.id,
				},
			}),
		);
		dispatch(
			updateMode({
				input: {
					mode: playgroundModes.view,
				},
			}),
		);
	};
}
