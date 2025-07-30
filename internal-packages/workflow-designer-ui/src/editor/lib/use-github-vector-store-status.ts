import type { Node } from "@giselle-sdk/data-type";
import { isVectorStoreNode } from "@giselle-sdk/data-type";
import { useVectorStore } from "@giselle-sdk/giselle/react";
import { useMemo } from "react";

export function useGitHubVectorStoreStatus(node: Node) {
	const vectorStore = useVectorStore();
	const githubRepositoryIndexes = vectorStore?.githubRepositoryIndexes ?? [];

	return useMemo(() => {
		if (
			!isVectorStoreNode(node, "github") ||
			node.content.source.state.status !== "configured"
		) {
			return { isOrphaned: false, repositoryId: undefined };
		}

		const { owner, repo } = node.content.source.state;
		const contentType = node.content.source.state.contentType;

		const foundInfo = githubRepositoryIndexes.find(
			(info) =>
				info.owner === owner &&
				info.repo === repo &&
				info.availableContentTypes.includes(contentType),
		);

		return {
			isOrphaned: !foundInfo,
			repositoryId: foundInfo?.id,
		};
	}, [node, githubRepositoryIndexes]);
}
