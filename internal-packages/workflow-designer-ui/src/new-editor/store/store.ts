"use client";

import type {
	InputId,
	NodeId,
	NodeLike,
	OutputId,
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
	inputsByNodeId: Record<NodeId, InputId[]>;
	outputsByNodeId: Record<NodeId, OutputId[]>;
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
				inputsByNodeId: Object.fromEntries(
					initial.workspace.nodes.map((node) => [
						node.id,
						node.inputs.map((input) => input.id),
					]),
				),
				outputsByNodeId: Object.fromEntries(
					initial.workspace.nodes.map((node) => [
						node.id,
						node.outputs.map((output) => output.id),
					]),
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
