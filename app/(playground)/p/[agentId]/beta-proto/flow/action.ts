import type { Flow, FlowIndex } from "./types";

const v2FlowIndexActionTypes = {
	setFlowIndex: "v2.setFlowIndex",
} as const;

type V2FlowIndexActionType =
	(typeof v2FlowIndexActionTypes)[keyof typeof v2FlowIndexActionTypes];

interface SetFlowIndexAction {
	type: Extract<V2FlowIndexActionType, "v2.setFlowIndex">;
	input: SetFlowIndexActionInput;
}
interface SetFlowIndexActionInput {
	flowIndexes: FlowIndex[];
}

export type V2FlowIndexAction = SetFlowIndexAction;

export function isV2FlowIndexAction(
	action: unknown,
): action is V2FlowIndexAction {
	return Object.values(v2FlowIndexActionTypes).includes(
		(action as V2FlowIndexAction).type,
	);
}

export function setFlowIndexes({ input }: { input: SetFlowIndexActionInput }) {
	return {
		type: v2FlowIndexActionTypes.setFlowIndex,
		input,
	};
}

export function v2FlowIndexReducer(
	flowIndexes: FlowIndex[],
	action: V2FlowIndexAction,
): FlowIndex[] {
	switch (action.type) {
		case v2FlowIndexActionTypes.setFlowIndex:
			return action.input.flowIndexes;
	}
	return flowIndexes;
}

const v2FlowActionTypes = {
	setFlow: "v2.setFlow",
} as const;

type V2FlowActionType =
	(typeof v2FlowActionTypes)[keyof typeof v2FlowActionTypes];

interface SetFlowAction {
	type: Extract<V2FlowActionType, "v2.setFlow">;
	input: SetFlowActionInput;
}
interface SetFlowActionInput {
	flow: Flow;
}
export function setFlow({ input }: { input: SetFlowActionInput }) {
	return {
		type: v2FlowActionTypes.setFlow,
		input,
	};
}

export type V2FlowAction = SetFlowAction;

export function isV2FlowAction(action: unknown): action is V2FlowAction {
	return Object.values(v2FlowActionTypes).includes(
		(action as V2FlowAction).type,
	);
}

export function v2FlowReducer(
	flow: Flow | null | undefined,
	action: V2FlowAction,
): Flow | null | undefined {
	switch (action.type) {
		case v2FlowActionTypes.setFlow:
			return action.input.flow;
	}
	return flow;
}
