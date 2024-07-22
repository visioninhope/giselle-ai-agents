import type { NodeTypes } from "@xyflow/react";
import { useMemo } from "react";
import { NodeV3 } from "./nodev3";
export const NodeType = {
	V3: "v3",
} as const;

export const useNodeTypes = () =>
	useMemo<NodeTypes>(
		() => ({
			[NodeType.V3]: NodeV3,
		}),
		[],
	);
