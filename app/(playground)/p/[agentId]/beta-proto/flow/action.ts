import type { Flow, QueuedFlow, RunningFlow } from "./types";

const v2FlowActionTypes = {
	setFlow: "v2.setFlow",
} as const;

type V2FlowActionType =
	(typeof v2FlowActionTypes)[keyof typeof v2FlowActionTypes];

interface SetFlowAction {
	type: Extract<V2FlowActionType, "v2.setFlow">;
	input: SetFlowActionInput;
}
type SetFlowActionInput =
	| Omit<QueuedFlow, "object">
	| Omit<RunningFlow, "object">;

export type V2FlowAction = SetFlowAction;

export function isV2FlowAction(action: unknown): action is V2FlowAction {
	return Object.values(v2FlowActionTypes).includes(
		(action as V2FlowAction).type,
	);
}

export function setFlow({ input }: { input: SetFlowActionInput }) {
	return {
		type: v2FlowActionTypes.setFlow,
		input,
	};
}

export function v2FlowReducer(
	flow: Flow | null | undefined,
	action: V2FlowAction,
): Flow | null | undefined {
	switch (action.type) {
		case v2FlowActionTypes.setFlow:
			return { ...action.input, object: "flow" };
	}
	return flow;
}
