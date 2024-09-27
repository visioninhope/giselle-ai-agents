import type { GiselleNodeCategory, GiselleNodeId } from "../giselle-node/types";

export type ConnectorId = `cn_${string}`;
export type ConnectorObject = {
	id: ConnectorId;
	object: "connector";
	source: GiselleNodeId;
	sourceNodeCategory: GiselleNodeCategory;
	target: GiselleNodeId;
	targetHandle: string;
	targetNodeCategory: GiselleNodeCategory;
};
