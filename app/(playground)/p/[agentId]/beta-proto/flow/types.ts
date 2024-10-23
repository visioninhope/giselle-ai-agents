import type { GiselleNodeId } from "../giselle-node/types";

export interface Flow {
	object: "flow";
	finalNodeId: GiselleNodeId;
}
