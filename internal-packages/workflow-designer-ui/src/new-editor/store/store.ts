"use client";

import type {
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
	ui: UIState;
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
				nodeOrder: initial.workspace.nodes.map((node) => node.id),
				ui: initial.workspace.ui,
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
