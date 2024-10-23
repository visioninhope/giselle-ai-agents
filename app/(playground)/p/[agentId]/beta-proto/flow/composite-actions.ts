import type { GiselleNode } from "../giselle-node/types";
import type { ThunkAction } from "../graph/context";
import { playgroundModes } from "../graph/types";
import { updateMode } from "../graph/v2/mode";

export function runFlow(finalNode: GiselleNode): ThunkAction {
	return async (dispatch, getState) => {
		const state = getState();
		dispatch(
			updateMode({
				input: {
					mode: playgroundModes.view,
				},
			}),
		);
	};
}
