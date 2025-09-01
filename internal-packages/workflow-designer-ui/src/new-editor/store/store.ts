"use client";

import type {
	NodeId,
	NodeLike,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import type { NodeChange } from "@xyflow/react";
import { createStore } from "zustand";
import { combine } from "zustand/middleware";
import { isNodeId } from "../lib/is-node-id";
import { logger } from "../lib/logger";

export interface EditorState extends Omit<Workspace, "id"> {
	workspaceId: WorkspaceId;
}

export interface EditorAction {
	updateNode: (id: NodeId, patch: Partial<NodeLike>) => void;
	onNodesChange: (changes: NodeChange[]) => void;
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
