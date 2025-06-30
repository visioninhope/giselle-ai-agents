import type {
	InputId,
	NodeLike,
	OutputId,
	Workspace,
} from "@giselle-sdk/data-type";
import { ConnectionId } from "@giselle-sdk/data-type";
import { useCallback } from "react";

export function useAddConnection(
	setWorkspace: React.Dispatch<React.SetStateAction<Workspace>>,
) {
	return useCallback(
		({
			outputNode,
			outputId,
			inputNode,
			inputId,
		}: {
			outputNode: NodeLike;
			outputId: OutputId;
			inputNode: NodeLike;
			inputId: InputId;
		}) => {
        setWorkspace((ws) => ({
                ...ws,
                connections: [
                        ...ws.connections,
                        {
                                id: ConnectionId.generate(),
                                outputNode: {
                                        id: outputNode.id,
                                        type: outputNode.type,
                                        content: { type: outputNode.content.type },
                                } as any,
                                outputId,
                                inputNode: {
                                        id: inputNode.id,
                                        type: inputNode.type,
                                        content: { type: inputNode.content.type },
                                } as any,
                                inputId,
                        },
                ],
        }));
		},
		[setWorkspace],
	);
}
