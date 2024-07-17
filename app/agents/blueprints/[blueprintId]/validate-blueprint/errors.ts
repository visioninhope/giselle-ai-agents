const startingPointNotFound = {
	type: "STARTING_POINT_NOT_FOUND",
} as const;
const endingPointNotFound = {
	type: "ENDING_POINT_NOT_FOUND",
} as const;

export type BlueprintValidationError =
	| typeof startingPointNotFound
	| typeof endingPointNotFound;
