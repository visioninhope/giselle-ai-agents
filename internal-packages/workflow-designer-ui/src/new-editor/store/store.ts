"use client";

import type {
	NodeId,
	NodeLike,
	Workspace,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import { createStore } from "zustand";
import { combine } from "zustand/middleware";

export interface EditorState {
	workspaceId: WorkspaceId;
	nodesById: Record<NodeId, NodeLike>;
}
export interface EditorAction {
	updateNode: (id: NodeId, patch: Partial<NodeLike>) => void;
}

export type EditorStore = ReturnType<typeof createEditorStore>;

export function createEditorStore(initial: { workspace: Workspace }) {
	return createStore(
		combine<EditorState, EditorAction>(
			{
				workspaceId: initial.workspace.id,
				nodesById: Object.fromEntries(
					initial.workspace.nodes.map((node) => [node.id, node]),
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
