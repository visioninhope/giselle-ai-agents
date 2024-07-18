export const startWithOnRequestNode = {
	type: "START_WITH_ON_REQUEST_NODE",
} as const;
export const endWithResponseNode = {
	type: "END_WITH_RESPONSE_NODE",
} as const;

export type BlueprintRequiredAction =
	| typeof startWithOnRequestNode
	| typeof endWithResponseNode;
