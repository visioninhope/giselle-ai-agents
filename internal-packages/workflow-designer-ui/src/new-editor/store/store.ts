"use client";

import type {
	NodeId,
	NodeLike,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import type { NodeMouseHandler, OnNodesChange } from "@xyflow/react";
import { createStore } from "zustand";
import { combine } from "zustand/middleware";
import { isNodeId } from "../lib/is-node-id";
import { logger } from "../lib/logger";

export interface EditorState extends Omit<Workspace, "id"> {
	workspaceId: WorkspaceId;
}

export interface EditorAction {
	updateNode: (id: NodeId, patch: Partial<NodeLike>) => void;
	onNodesChange: OnNodesChange;
	onNodeClick: NodeMouseHandler;
	setInspectedNodeId: (id: NodeId | undefined) => void;
}

export type EditorStore = ReturnType<typeof createEditorStore>;

export function createEditorStore(initial: { workspace: Workspace }) {
	return createStore(
		combine<EditorState, EditorAction>(
			{
				workspaceId: initial.workspace.id,
				...initial.workspace,
			},
			(set) => ({
				updateNode: (id, patch) =>
					set((s) => ({
						nodes: s.nodes.map((node) =>
							node.id === id ? ({ ...node, ...patch } as NodeLike) : node,
						),
					})),
				setInspectedNodeId: (id) =>
					set((s) => ({
						ui: {
							...s.ui,
							inspectedNodeId: id,
						},
					})),
				onNodeClick: (_event, node) => {
					set((s) => {
						if (!isNodeId(node.id)) {
							return s;
						}
						return {
							ui: {
								...s.ui,
								inspectedNodeId: node.id,
							},
						};
					});
				},
				onNodesChange: (changes) => {
					set((s) => {
						const nodeState = { ...s.ui.nodeState };
						let nodes = s.nodes;
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
									if (!isNodeId(change.id)) {
										break;
									}
									logger.trace(change, "remove node");
									delete nodeState[change.id];
									nodes = nodes.filter((node) => node.id !== change.id);
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
							nodes,
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
