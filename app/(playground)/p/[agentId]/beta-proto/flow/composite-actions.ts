import type { GiselleNode } from "../giselle-node/types";
import type { CompositeAction } from "../graph/context";
import { playgroundModes } from "../graph/types";
import { updateMode } from "../graph/v2/mode";
import { setFlow, setFlowIndexes } from "./action";
import { putFlow, runAction } from "./server-action";
import { flowStatuses } from "./types";
import {
	buildFlow,
	buildFlowIndex,
	createFlowActionId,
	createFlowId,
	resolveActionLayers,
} from "./utils";

export function runFlow(finalNode: GiselleNode): CompositeAction {
	return async (dispatch, getState) => {
		const state = getState();
		const flow = buildFlow({
			input: {
				agentId: state.graph.agentId,
				finalNodeId: finalNode.id,
				graph: state.graph,
			},
		});
		dispatch(setFlow({ input: { flow } }));
		dispatch(
			setFlowIndexes({
				input: {
					flowIndexes: [
						...getState().graph.flowIndexes,
						buildFlowIndex({ input: flow }),
					],
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
		const blob = await putFlow({ input: { flow } });
		dispatch(
			setFlow({
				input: {
					flow: {
						...flow,
						status: flowStatuses.queued,
						dataUrl: blob.url,
					},
				},
			}),
		);
		dispatch(
			setFlowIndexes({
				input: {
					flowIndexes: getState().graph.flowIndexes.map((flowIndex) =>
						flowIndex.id === flow.id
							? buildFlowIndex({ input: flow })
							: flowIndex,
					),
				},
			}),
		);
		for (const actionLayer of flow.actionLayers) {
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
