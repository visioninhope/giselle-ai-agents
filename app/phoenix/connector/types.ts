import type { GiselleNodeCategory, GiselleNodeId } from "../giselle-node/types";

export type ConnectorId = `cn_${string}`;
export type Connector = {
	id: ConnectorId;
	source: GiselleNodeId;
	sourceNodeCategory: GiselleNodeCategory;
	target: GiselleNodeId;
	targetHandle: string;
	targetNodeCategory: GiselleNodeCategory;
};
