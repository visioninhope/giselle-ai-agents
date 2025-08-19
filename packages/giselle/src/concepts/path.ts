import type { ActId } from "./identifiers";

export function actGenerationIndexesPath(actId: ActId) {
	return `generations/byAct/${actId}.json` as const;
}
