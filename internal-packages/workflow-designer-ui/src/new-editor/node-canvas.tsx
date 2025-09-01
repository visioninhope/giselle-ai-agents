"use client";

import type { NodeId } from "@giselle-sdk/data-type";
import { ReactFlow, type Node as RFNode } from "@xyflow/react";
import { memo, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { Background } from "../ui/background";
import { Node } from "./components";
import { useEditorStoreWithEqualityFn } from "./store/context";

export function NodeCanvas() {
	const nodes = useEditorStoreWithEqualityFn(
		(s) =>
			s.nodeOrder.map((nodeId) => {
				const nodeUiState = s.ui.nodeState[nodeId];
				s.nodesById[nodeId];
				return {
					id: nodeId,
					type: "custom",
					position: nodeUiState.position,
					selected: nodeUiState.selected,
					data: {},
				} satisfies RFNode;
			}),
		shallow,
	);
	const nodeTypes = useMemo(
		() => ({
			custom: memo(Node),
		}),
		[],
	);
	return (
		<ReactFlow
			nodes={nodes}
			edges={[]}
			nodeTypes={nodeTypes}
			className="flex-1"
		>
			<Background />
		</ReactFlow>
	);
}
