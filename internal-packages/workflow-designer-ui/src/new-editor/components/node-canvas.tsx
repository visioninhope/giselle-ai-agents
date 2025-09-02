"use client";

import type { NodeId } from "@giselle-sdk/data-type";
import { ReactFlow, type Node as RFNode } from "@xyflow/react";
import { memo, useMemo, useRef } from "react";
import { shallow } from "zustand/shallow";
import { Background } from "../../ui/background";
import { isNodeId } from "../lib/is-node-id";
import { selectCanvasData } from "../lib/selectors";
import { useEditorStore, useEditorStoreWithEqualityFn } from "../store/context";
import { Node } from "./node";

export function NodeCanvas() {
	// Subscribe to node UI data and edges in a single selector
	const { nodeUiData, edges } = useEditorStoreWithEqualityFn(
		selectCanvasData,
		shallow,
	);

	// Preserve RFNode object identity for unchanged items.
	const cacheRef = useRef<Map<NodeId, RFNode>>(new Map());
	const nodes = useMemo(() => {
		const next = new Map<NodeId, RFNode>();
		const arr = nodeUiData
			.map(({ id, position, selected }) => {
				if (!isNodeId(id)) {
					return null;
				}
				const prev = cacheRef.current.get(id);
				if (
					prev &&
					prev.selected === selected &&
					prev.position.x === position.x &&
					prev.position.y === position.y
				) {
					next.set(id, prev);
					return prev;
				}
				const node: RFNode = {
					id,
					type: "custom",
					position,
					selected,
					data: prev?.data ?? {},
				};
				next.set(id, node);
				return node;
			})
			.filter((node) => node !== null);
		cacheRef.current = next;
		return arr;
	}, [nodeUiData]);
	const onNodesChange = useEditorStore((s) => s.onNodesChange);
	const onNodeClick = useEditorStore((s) => s.onNodeClick);
	const nodeTypes = useMemo(
		() => ({
			custom: memo(Node),
		}),
		[],
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			nodeTypes={nodeTypes}
			className="flex-1"
			onNodeClick={onNodeClick}
		>
			<Background />
		</ReactFlow>
	);
}
