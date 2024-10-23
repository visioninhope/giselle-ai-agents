import type { GiselleNodeId } from "../giselle-node/types";
import type { Flow } from "./types";

const v2FlowActionTypes = {
	setFlow: "v2.setFlow",
} as const;

type V2FlowActionType =
	(typeof v2FlowActionTypes)[keyof typeof v2FlowActionTypes];

interface SetFlowAction {
	type: Extract<V2FlowActionType, "v2.setFlow">;
	input: SetFlowInput;
}

interface SetFlowInput extends Partial<Flow> {}

export type V2FlowAction = SetFlowAction;

export function isV2FlowAction(action: unknown): action is V2FlowAction {
	return Object.values(v2FlowActionTypes).includes(
		(action as V2FlowAction).type,
	);
}

export function setFlow({ input }: { input: SetFlowInput }) {
	return {
		type: v2FlowActionTypes.setFlow,
		input,
	};
}

export function v2FlowReducer(flow: Flow, action: V2FlowAction): Flow {
	switch (action.type) {
		case v2FlowActionTypes.setFlow:
			return { ...flow, ...action.input };
	}
	return flow;
}
