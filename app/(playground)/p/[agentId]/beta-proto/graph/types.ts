import type { Artifact } from "../artifact/types";
import type { ConnectorObject } from "../connector/types";
import type { GiselleNode, GiselleNodeId } from "../giselle-node/types";

export type ArtifactAndMetadata = Artifact & {
	authorNodeId: GiselleNodeId;
	materialNodeIds: GiselleNodeId[];
};

export type Graph = {
	nodes: GiselleNode[];
	connectors: ConnectorObject[];
	artifacts: ArtifactAndMetadata[];
};

export type GraphState = {
	graph: Graph;
};
