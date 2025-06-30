import type { Node, NodeUIState, Workspace } from "@giselle-sdk/data-type";
import { nodeFactories } from "@giselle-sdk/node-utils";
import { useCallback } from "react";
import type { ConnectionCloneStrategy } from "../types";
import { isSupportedConnection } from "../utils";
import { useAddConnection } from "./use-connection";

const DEFAULT_CONNECTION_CLONE_STRATEGY: ConnectionCloneStrategy =
	"inputs-only";

export function useCopyNode(
	workspace: Workspace,
	setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>,
) {
	const addConnection = useAddConnection(setWorkspace);
	return useCallback(
		(
			sourceNode: Node,
			options?: {
				ui?: NodeUIState;
				connectionCloneStrategy?: ConnectionCloneStrategy;
			},
		): Node | undefined => {
			const { newNode, inputIdMap, outputIdMap } =
				nodeFactories.clone(sourceNode);
			setWorkspace((ws) => {
				const ui = { ...ws.ui, nodeState: { ...ws.ui.nodeState } };
				if (options?.ui) {
					ui.nodeState[newNode.id] = options.ui;
				}
				return { ...ws, nodes: [...ws.nodes, newNode], ui };
			});
			const strategy =
				options?.connectionCloneStrategy ?? DEFAULT_CONNECTION_CLONE_STRATEGY;
			for (const originalConnection of workspace.connections) {
				if (
					originalConnection.inputNode.id === sourceNode.id &&
					(strategy === "all" || strategy === "inputs-only")
				) {
					const outputNode = workspace.nodes.find(
						(n) => n.id === originalConnection.outputNode.id,
					);
					const newInputId = inputIdMap[originalConnection.inputId];
					if (outputNode && newInputId) {
						const connectionExists = workspace.connections.some(
							(c) =>
								c.outputNode.id === outputNode.id &&
								c.outputId === originalConnection.outputId &&
								c.inputNode.id === newNode.id &&
								c.inputId === newInputId,
						);
						const connectionValid = isSupportedConnection(
							outputNode,
							newNode,
						).canConnect;
						if (!connectionExists && connectionValid) {
							addConnection({
								outputNode,
								outputId: originalConnection.outputId,
								inputNode: newNode,
								inputId: newInputId,
							});
						}
					}
				} else if (
					originalConnection.outputNode.id === sourceNode.id &&
					strategy === "all"
				) {
					const inputNode = workspace.nodes.find(
						(n) => n.id === originalConnection.inputNode.id,
					);
					const newOutputId = outputIdMap[originalConnection.outputId];
					if (inputNode && newOutputId) {
						const connectionExists = workspace.connections.some(
							(c) =>
								c.outputNode.id === newNode.id &&
								c.outputId === newOutputId &&
								c.inputNode.id === inputNode.id &&
								c.inputId === originalConnection.inputId,
						);
						const connectionValid = isSupportedConnection(
							newNode,
							inputNode,
						).canConnect;
						if (!connectionExists && connectionValid) {
							addConnection({
								outputNode: newNode,
								outputId: newOutputId,
								inputNode,
								inputId: originalConnection.inputId,
							});
						}
					}
				}
			}
			return newNode;
		},
		[workspace, setWorkspace, addConnection],
	);
}
