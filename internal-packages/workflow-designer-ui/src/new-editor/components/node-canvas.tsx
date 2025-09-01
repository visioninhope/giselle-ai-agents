"use client";

import type { NodeId } from "@giselle-sdk/data-type";
import { ReactFlow, type Node as RFNode } from "@xyflow/react";
import { memo, useMemo, useRef } from "react";
import { shallow } from "zustand/shallow";
import { Background } from "../../ui/background";
import { isNodeId } from "../lib/is-node-id";
import { selectUiSliceForRFNodes } from "../lib/selectors";
import { useEditorStore, useEditorStoreWithEqualityFn } from "../store/context";
import { Node } from "./node";

export function NodeCanvas() {
	// Subscribe only to UI state (position/selected) and order.
	const uiSlice = useEditorStoreWithEqualityFn(
		(s) => selectUiSliceForRFNodes(s),
		shallow,
	);

	// Preserve RFNode object identity for unchanged items.
	const cacheRef = useRef<Map<NodeId, RFNode>>(new Map());
	const nodes = useMemo(() => {
		const next = new Map<NodeId, RFNode>();
		const arr = uiSlice
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
	}, [uiSlice]);
	const onNodesChange = useEditorStore((s) => s.onNodesChange);
	const nodeTypes = useMemo(
		() => ({
			custom: memo(Node),
		}),
		[],
	);

	return (
		<ReactFlow
			nodes={nodes}
			onNodesChange={onNodesChange}
			nodeTypes={nodeTypes}
			className="flex-1"
		>
			<Background />
		</ReactFlow>
	);
}
