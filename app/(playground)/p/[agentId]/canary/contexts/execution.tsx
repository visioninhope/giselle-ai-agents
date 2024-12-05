"use client";

import { type StreamableValue, readStreamableValue } from "ai/rsc";
import { type ReactNode, createContext, useCallback, useContext } from "react";
import type { ArtifactId, NodeId, TextArtifactObject } from "../types";
import { createArtifactId } from "../utils";
import { useGraph } from "./graph";
import { usePropertiesPanel } from "./properties-panel";

interface ExecutionContextType {
	execute: (nodeId: NodeId) => Promise<void>;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(
	undefined,
);

interface ExecutionProviderProps {
	children: ReactNode;
	executeAction: (
		artifactId: ArtifactId,
		graphUrl: string,
		nodeId: NodeId,
	) => Promise<StreamableValue<TextArtifactObject, unknown>>;
}

export function ExecutionProvider({
	children,
	executeAction,
}: ExecutionProviderProps) {
	const { dispatch, flush } = useGraph();
	const { setTab } = usePropertiesPanel();
	const execute = useCallback(
		async (nodeId: NodeId) => {
			const artifactId = createArtifactId();
			dispatch({
				type: "upsertArtifact",
				input: {
					nodeId,
					artifact: {
						id: artifactId,
						type: "streamArtifact",
						creatorNodeId: nodeId,
						object: {
							type: "text",
							title: "",
							content: "",
							messages: {
								plan: "",
								description: "",
							},
						},
					},
				},
			});
			setTab("Result");
			const latestGraphUrl = await flush();
			const stream = await executeAction(artifactId, latestGraphUrl, nodeId);

			let textArtifactObject: TextArtifactObject = {
				type: "text",
				title: "",
				content: "",
				messages: {
					plan: "",
					description: "",
				},
			};
			for await (const streamContent of readStreamableValue(stream)) {
				if (streamContent === undefined) {
					continue;
				}
				dispatch({
					type: "upsertArtifact",
					input: {
						nodeId,
						artifact: {
							id: artifactId,
							type: "streamArtifact",
							creatorNodeId: nodeId,
							object: streamContent,
						},
					},
				});
				textArtifactObject = {
					...textArtifactObject,
					...streamContent,
				};
			}
			dispatch({
				type: "upsertArtifact",
				input: {
					nodeId,
					artifact: {
						id: artifactId,
						type: "generatedArtifact",
						creatorNodeId: nodeId,
						createdAt: Date.now(),
						object: textArtifactObject,
					},
				},
			});
		},
		[executeAction, dispatch, flush, setTab],
	);
	return (
		<ExecutionContext.Provider value={{ execute }}>
			{children}
		</ExecutionContext.Provider>
	);
}

export function useExecution() {
	const context = useContext(ExecutionContext);
	if (!context) {
		throw new Error("useExecution must be used within an ExecutionProvider");
	}
	return context.execute;
}
