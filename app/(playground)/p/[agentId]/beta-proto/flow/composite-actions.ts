import type { GiselleNode } from "../giselle-node/types";
import type { CompositeAction } from "../graph/context";
import { playgroundModes } from "../graph/types";
import { updateMode } from "../graph/v2/mode";
import { setFlow, setFlowIndexes } from "./action";
import { putFlow, runAction } from "./server-action";
import {
	type Flow,
	type FlowAction,
	type FlowActionLayer,
	type FlowActionStatus,
	flowActionStatuses,
	flowStatuses,
} from "./types";
import {
	buildFlow,
	buildFlowIndex,
	createFlowActionId,
	createFlowId,
	resolveActionLayers,
} from "./utils";

const updateActionStatus = ({
	input,
}: {
	input: {
		flow: Flow;
		actionLayer: FlowActionLayer;
		action: FlowAction;
		status: FlowActionStatus;
	};
}): Flow => ({
	...input.flow,
	actionLayers: input.flow.actionLayers.map((actionLayer) =>
		actionLayer.id === input.actionLayer.id
			? {
					...actionLayer,
					actions: actionLayer.actions.map((action) =>
						action.id === input.action.id
							? { ...action, status: input.status }
							: action,
					),
				}
			: actionLayer,
	),
});

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
		let mutableFlow: Flow = flow;
		for (const actionLayer of flow.actionLayers) {
			await Promise.all(
				actionLayer.actions.map(async (action) => {
					mutableFlow = updateActionStatus({
						input: {
							flow: mutableFlow,
							actionLayer,
							action,
							status: flowActionStatuses.running,
						},
					});
					dispatch(
						setFlow({
							input: {
								flow: mutableFlow,
							},
						}),
					);
					await runAction({
						nodeId: action.nodeId,
						agentId: state.graph.agentId,
						stream: true,
					});
					mutableFlow = updateActionStatus({
						input: {
							flow: mutableFlow,
							actionLayer,
							action,
							status: flowActionStatuses.completed,
						},
					});
					dispatch(
						setFlow({
							input: {
								flow: mutableFlow,
							},
						}),
					);
				}),
			);
		}
	};
}
