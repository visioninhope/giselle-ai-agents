import type { Node } from "@giselle-sdk/data-type";
import {
	isActionNode,
	isTriggerNode,
	isVectorStoreNode,
} from "@giselle-sdk/data-type";
import { useVectorStore } from "giselle-sdk/react";
import { CircleAlertIcon } from "lucide-react";
import { type ReactElement, useMemo } from "react";
import {
	GitHubRepositoryBadge,
	GitHubRepositoryBadgeFromRepo,
	GitHubRepositoryBadgeFromTrigger,
} from "./";

function RequiresSetupBadge(): ReactElement {
	return (
		<div className="pl-[16px] relative pr-[32px]">
			<div className="inline-flex items-center justify-center bg-[#342527] text-[#d7745a] rounded-full text-[12px] pl-[10px] pr-[12px] py-2 gap-[6px]">
				<CircleAlertIcon className="size-[18px]" />
				<span>REQUIRES SETUP</span>
			</div>
		</div>
	);
}

export function GitHubNodeInfo({ node }: { node: Node }): ReactElement | null {
	const vectorStore = useVectorStore();
	const github = vectorStore?.github;

	const isOrphanedVectorNode = useMemo(() => {
		if (
			!isVectorStoreNode(node, "github") ||
			node.content.source.state.status !== "configured"
		) {
			return false;
		}

		const { owner, repo } = node.content.source.state;
		const vectorStoreInfos = github ?? [];
		const exists = vectorStoreInfos.some(
			(info) => info.reference.owner === owner && info.reference.repo === repo,
		);
		return !exists;
	}, [node, github]);

	if (isTriggerNode(node, "github")) {
		return node.content.state.status === "configured" ? (
			<div className="px-[16px] relative">
				<GitHubRepositoryBadgeFromTrigger
					flowTriggerId={node.content.state.flowTriggerId}
				/>
			</div>
		) : (
			<RequiresSetupBadge />
		);
	}

	if (isActionNode(node, "github")) {
		return node.content.command.state.status === "configured" ? (
			<div className="px-[16px] relative">
				<GitHubRepositoryBadgeFromRepo
					installationId={node.content.command.state.installationId}
					repositoryNodeId={node.content.command.state.repositoryNodeId}
				/>
			</div>
		) : (
			<RequiresSetupBadge />
		);
	}

	if (isVectorStoreNode(node, "github")) {
		return node.content.source.state.status === "configured" &&
			!isOrphanedVectorNode ? (
			<div className="px-[16px] relative">
				<GitHubRepositoryBadge
					owner={node.content.source.state.owner}
					repo={node.content.source.state.repo}
				/>
			</div>
		) : (
			<RequiresSetupBadge />
		);
	}

	return null;
}
