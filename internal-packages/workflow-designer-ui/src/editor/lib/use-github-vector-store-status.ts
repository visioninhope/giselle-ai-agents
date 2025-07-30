import type { Node } from "@giselle-sdk/data-type";
import { isVectorStoreNode } from "@giselle-sdk/data-type";
import { useVectorStore } from "@giselle-sdk/giselle/react";
import { useMemo } from "react";

export function useGitHubVectorStoreStatus(node: Node) {
	const vectorStore = useVectorStore();
	const githubCode = vectorStore?.githubCode;
	const githubPullRequest = vectorStore?.githubPullRequest;

	return useMemo(() => {
		if (
			(!isVectorStoreNode(node, "github") &&
				!isVectorStoreNode(node, "githubPullRequest")) ||
			node.content.source.state.status !== "configured"
		) {
			return { isOrphaned: false, repositoryId: undefined };
		}

		const { owner, repo } = node.content.source.state;

		// Select the appropriate repository list based on the provider
		const vectorStoreInfos = isVectorStoreNode(node, "githubPullRequest")
			? (githubPullRequest ?? [])
			: (githubCode ?? []);

		const foundInfo = vectorStoreInfos.find(
			(info) => info.reference.owner === owner && info.reference.repo === repo,
		);

		return {
			isOrphaned: !foundInfo,
			repositoryId: foundInfo?.id,
		};
	}, [node, githubCode, githubPullRequest]);
}
