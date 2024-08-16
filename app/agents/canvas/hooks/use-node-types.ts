import { GiselleNode } from "@/app/nodes";
import type { NodeTypes } from "@xyflow/react";
import { useMemo } from "react";
export enum NodeType {
	Giselle = "giselle",
}
export const useNodeTypes = () =>
	useMemo<NodeTypes>(
		() => ({
			[NodeType.Giselle]: GiselleNode,
		}),
		[],
	);
