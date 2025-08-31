"use client";

import { Input } from "@giselle-internal/ui/input";
import type { NodeId } from "@giselle-sdk/data-type";
import {
	Background,
	Controls,
	type Node,
	type NodeProps,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo, useCallback, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useEditorStore, useEditorStoreWithEqualityFn } from "./store/context";

// Minimal demo of React Flow with custom nodes subscribing to zustand per-node.

export function FlowDemo() {
	// Only subscribe to the list of IDs; rows subscribe to their own data.
	const nodeIds = useEditorStoreWithEqualityFn(
		(s) => Object.keys(s.nodesById).sort() as NodeId[],
		shallow,
	);

	// Provide minimal node objects: id/type/position only.
	const nodes = useMemo(() => {
		return nodeIds.map((id, i) => ({
			id,
			type: "z-node",
			position: { x: (i % 4) * 240, y: Math.floor(i / 4) * 140 },
		})) as Node[];
	}, [nodeIds]);

	const nodeTypes = useMemo(
		() => ({
			"z-node": memo(ZNode),
		}),
		[],
	);

	return (
		<div style={{ height: 480 }} className="border rounded">
			<ReactFlow nodes={nodes} edges={[]} nodeTypes={nodeTypes}>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
}

function ZNode({ id }: NodeProps) {
	// Subscribe only to this node's slice.
	const node = useEditorStoreWithEqualityFn(
		(s) => s.nodesById[id as NodeId],
		shallow,
	);
	const updateNode = useEditorStore((s) => s.updateNode);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateNode(id as NodeId, { name: e.target.value });
		},
		[id, updateNode],
	);

	return (
		<div className="rounded border bg-white p-2 shadow-sm">
			<div className="text-xs text-gray-500">{id}</div>
			<div className="font-medium">{node.type}</div>
			<Input
				className="nodrag"
				value={node.name}
				onChange={onChange}
				placeholder="name"
			/>
		</div>
	);
}
