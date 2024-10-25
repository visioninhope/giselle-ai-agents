import type { GiselleNode } from "../giselle-node/types";
import type { CompositeAction } from "../graph/context";
import { playgroundModes } from "../graph/types";
import { updateMode } from "../graph/v2/mode";
import { setFlow } from "./action";
import { runAction } from "./server-action";
import { flowStatuses } from "./types";
import { createFlowActionId, createFlowId, resolveActionLayers } from "./utils";

export function runFlow(finalNode: GiselleNode): CompositeAction {
	return async (dispatch, getState) => {
		const state = getState();
		dispatch(
			setFlow({
				input: {
					id: createFlowId(),
					status: flowStatuses.queued,
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
		const actionLayers = resolveActionLayers(
			state.graph.connectors,
			finalNode.id,
		);
		dispatch(
			setFlow({
				input: {
					id: createFlowId(),
					status: flowStatuses.running,
					finalNodeId: finalNode.id,
					actionLayers,
				},
			}),
		);
		for (const actionLayer of actionLayers) {
			await Promise.all(
				actionLayer.actions.map(async (action) => {
					await runAction({
						nodeId: action.nodeId,
						agentId: state.graph.agentId,
					});
				}),
			);
		}
	};
}
