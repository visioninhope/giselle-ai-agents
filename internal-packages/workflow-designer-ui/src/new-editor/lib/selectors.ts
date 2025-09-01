"use client";

import type { Connection, NodeId, NodeLike } from "@giselle-sdk/data-type";
import type { Edge as RFEdge, Node as RFNode } from "@xyflow/react";
import type { EditorAction, EditorState } from "../store/store";

// Narrow, reusable selectors to keep components minimal and stable.

export function selectUiSliceForRFNodes(
	s: EditorState & EditorAction,
): Pick<RFNode, "id" | "position" | "selected">[] {
	return s.nodes.map((node) => {
		const ui = s.ui.nodeState[node.id];
		return {
			id: node.id,
			position: ui.position,
			selected: ui.selected ?? false,
		};
	});
}

function groupByMap<T, K>(
	items: readonly T[],
	keyOf: (item: T) => K,
): Map<K, T[]> {
	const m = new Map<K, T[]>();
	for (const it of items) {
		const k = keyOf(it);
		const bucket = m.get(k);
		if (bucket) bucket.push(it);
		else m.set(k, [it]);
	}
	return m;
}

export function selectNodePanelDataById(id: NodeId) {
	return function selector(s: EditorState & EditorAction): {
		node: NodeLike | undefined;
		connectedInputIds?: string[];
		connectedOutputIds?: string[];
		highlighted: boolean;
		updateNode: EditorAction["updateNode"];
	} {
		const node = s.nodes.find((node) => node.id === id);

		const inputConnectionsByNodeId = groupByMap(
			s.connections,
			(connection) => connection.inputNode.id,
		);
		const outputConnectionsByNodeId = groupByMap(
			s.connections,
			(connection) => connection.outputNode.id,
		);
		return {
			node,
			connectedInputIds: inputConnectionsByNodeId
				?.get(id)
				?.map((c) => c.inputId),
			connectedOutputIds: outputConnectionsByNodeId
				?.get(id)
				?.map((c) => c.outputId),
			highlighted: s.ui.nodeState[id]?.highlighted ?? false,
			updateNode: s.updateNode,
		};
	};
}

export function buildEdgesFromConnections(
	connections: Iterable<Connection>,
): RFEdge[] {
	const edges: RFEdge[] = [];
	for (const c of connections) {
		edges.push({
			id: c.id,
			source: c.outputNode.id,
			sourceHandle: c.outputId,
			target: c.inputNode.id,
			targetHandle: c.inputId,
		});
	}
	return edges;
}

export function selectNodeIds(s: EditorState & EditorAction) {
	return s.nodes.map((node) => node.id);
}
export function selectNode(nodeId: NodeId) {
	return function selector(s: EditorState & EditorAction) {
		return s.nodes.find((node) => node.id === nodeId);
	};
}
