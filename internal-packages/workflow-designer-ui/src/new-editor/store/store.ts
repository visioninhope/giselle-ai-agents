"use client";

import {
	type Connection,
	NodeId,
	type NodeLike,
	type UIState,
	type Workspace,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { NodeChange } from "@xyflow/react";
import { createStore } from "zustand";
import { combine } from "zustand/middleware";
import { logger } from "../lib/logger";

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
	onNodesChange: (changes: NodeChange[]) => void;
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
				onNodesChange: (changes) => {
					set((s) => {
						const nodeState = { ...s.ui.nodeState };
						for (const change of changes) {
							switch (change.type) {
								case "position": {
									if (!isNodeId(change.id) || change.position === undefined) {
										break;
									}
									const node = nodeState[change.id];
									if (node === undefined) {
										break;
									}
									nodeState[change.id] = { ...node, position: change.position };
									break;
								}
								case "select": {
									if (!isNodeId(change.id)) {
										break;
									}
									const node = nodeState[change.id];
									if (node === undefined) {
										break;
									}
									nodeState[change.id] = { ...node, selected: change.selected };
									break;
								}
								case "add": {
									logger.trace(change, "add node");
									break;
								}
								case "dimensions": {
									logger.trace(change, "update dimensions");
									break;
								}
								case "remove": {
									logger.trace(change, "remove node");
									break;
								}
								case "replace": {
									logger.trace(change, "replace node");
									break;
								}
								default: {
									const _exhaustiveCheck: never = change;
									throw new Error(`Unhandled change type: ${_exhaustiveCheck}`);
								}
							}
						}
						return {
							ui: {
								...s.ui,
								nodeState,
							},
						};
					});
				},
			}),
		),
	);
}

function isNodeId(data: unknown): data is NodeId {
	const nodeId = NodeId.safeParse(data);
	return nodeId.success;
}
