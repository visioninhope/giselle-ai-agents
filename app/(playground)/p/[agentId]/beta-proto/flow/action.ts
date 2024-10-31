import type { Artifact } from "../artifact/types";
import type { Flow, FlowAction, FlowActionId, FlowIndex } from "./types";

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
	replaceFlowAction: "v2.replaceFlowAction",
	addArtifact: "v2.addArtifact",
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

interface ReplaceFlowActionAction {
	type: Extract<V2FlowActionType, "v2.replaceFlowAction">;
	input: ReplaceFlowActionActionInput;
}
type ReplaceFlowActionActionInput = FlowAction;
export function replaceFlowAction({
	input,
}: {
	input: ReplaceFlowActionActionInput;
}): ReplaceFlowActionAction {
	return {
		type: v2FlowActionTypes.replaceFlowAction,
		input,
	};
}

interface AddArtifactAction {
	type: Extract<V2FlowActionType, "v2.addArtifact">;
	input: AddArtifactActionInput;
}
interface AddArtifactActionInput {
	artifact: Artifact;
}
export function addArtifact({
	input,
}: {
	input: AddArtifactActionInput;
}): AddArtifactAction {
	return {
		type: v2FlowActionTypes.addArtifact,
		input,
	};
}

export type V2FlowAction =
	| SetFlowAction
	| ReplaceFlowActionAction
	| AddArtifactAction;

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
		case v2FlowActionTypes.replaceFlowAction:
			if (flow == null) {
				return flow;
			}
			return {
				...flow,
				actionLayers: flow.actionLayers.map((actionLayer) => ({
					...actionLayer,
					actions: actionLayer.actions.map((flowAction) =>
						flowAction.id === action.input.id ? action.input : flowAction,
					),
				})),
			};
		case v2FlowActionTypes.addArtifact:
			if (flow == null) {
				return flow;
			}
			return {
				...flow,
				artifacts: [...flow.artifacts, action.input.artifact],
			};
	}
	return flow;
}
