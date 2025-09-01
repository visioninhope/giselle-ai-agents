"use client";

import type { NodeId } from "@giselle-sdk/data-type";
import { ReactFlow, type Node as RFNode } from "@xyflow/react";
import { memo, useMemo, useRef } from "react";
import { shallow } from "zustand/shallow";
import { Background } from "../ui/background";
import { Node } from "./components";
import { useEditorStoreWithEqualityFn } from "./store/context";

export function NodeCanvas() {
	// Subscribe only to UI state (position/selected) and order.
	const uiSlice = useEditorStoreWithEqualityFn(
		(s) =>
			s.nodeOrder.map((id) => {
				const ui = s.ui.nodeState[id];
				return { id, position: ui.position, selected: ui.selected };
			}),
		shallow,
	);

	// Preserve RFNode object identity for unchanged items.
	const cacheRef = useRef<Map<NodeId, RFNode>>(new Map());
	const nodes = useMemo(() => {
		const next = new Map<NodeId, RFNode>();
		const arr = uiSlice.map(({ id, position, selected }) => {
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
		});
		cacheRef.current = next;
		return arr;
	}, [uiSlice]);
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
