"use client";

import type {
	Connection,
	NodeId,
	NodeLike,
	UIState,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import { createStore } from "zustand";
import { combine } from "zustand/middleware";

export interface EditorState {
	workspaceId: WorkspaceId;
	nodesById: Record<NodeId, NodeLike>;
	nodeOrder: NodeId[];
	inputConnectionsByNodeId: Map<NodeId, Connection[]>;
	outputConnectionsByNodeId: Map<NodeId, Connection[]>;
	ui: UIState;
}
export interface EditorAction {
	updateNode: (id: NodeId, patch: Partial<NodeLike>) => void;
}

export type EditorStore = ReturnType<typeof createEditorStore>;

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

export function createEditorStore(initial: { workspace: Workspace }) {
	return createStore(
		combine<EditorState, EditorAction>(
			{
				workspaceId: initial.workspace.id,
				nodesById: Object.fromEntries(
					initial.workspace.nodes.map((node) => [node.id, node]),
				),
				nodeOrder: initial.workspace.nodes.map((node) => node.id),
				ui: initial.workspace.ui,
				inputConnectionsByNodeId: groupByMap(
					initial.workspace.connections,
					(connection) => connection.inputNode.id,
				),
				outputConnectionsByNodeId: groupByMap(
					initial.workspace.connections,
					(connection) => connection.outputNode.id,
				),
			},
			(set) => ({
				updateNode: (id, patch) =>
					set((s) => ({
						nodesById: {
							...s.nodesById,
							[id]: { ...s.nodesById[id], ...patch },
						},
					})),
			}),
		),
	);
}
