import type { Node } from "@giselle-sdk/data-type";
import {
	isActionNode,
	isTriggerNode,
	isVectorStoreNode,
} from "@giselle-sdk/data-type";
import { CircleAlertIcon } from "lucide-react";
import type { ReactElement } from "react";
import { useGitHubVectorStoreStatus } from "../../lib/use-github-vector-store-status";
import {
	GitHubRepositoryBadge,
	GitHubRepositoryBadgeFromRepo,
	GitHubRepositoryBadgeFromTrigger,
} from "./";

function RequiresSetupBadge({ node }: { node: Node }): ReactElement {
	const getTextColor = () => {
		if (isTriggerNode(node, "github")) {
			return "text-fuchsia-400";
		}
		if (isActionNode(node, "github")) {
			return "text-purple-600";
		}
		if (isVectorStoreNode(node, "github")) {
			return "text-lime-400";
		}
		return "text-white";
	};

	return (
		<div className="flex items-center justify-center">
			<div
				className={`inline-flex items-center justify-center ${getTextColor()} font-semibold rounded-full text-[12px] pl-[10px] pr-[12px] py-2 gap-[6px] animate-pulse [animation-duration:2s]`}
			>
				<CircleAlertIcon className="size-[18px]" />
				<span>REQUIRES SETUP</span>
			</div>
		</div>
	);
}

export function GitHubNodeInfo({ node }: { node: Node }): ReactElement | null {
	const { isOrphaned: isVectorStoreOrphaned } =
		useGitHubVectorStoreStatus(node);

	if (isTriggerNode(node, "github")) {
		return node.content.state.status === "configured" ? (
			<div className="px-[16px] relative">
				<GitHubRepositoryBadgeFromTrigger
					flowTriggerId={node.content.state.flowTriggerId}
				/>
			</div>
		) : (
			<RequiresSetupBadge node={node} />
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
			<RequiresSetupBadge node={node} />
		);
	}

	if (isVectorStoreNode(node, "github")) {
		return node.content.source.state.status === "configured" &&
			!isVectorStoreOrphaned ? (
			<div className="px-[16px] relative">
				<GitHubRepositoryBadge
					owner={node.content.source.state.owner}
					repo={node.content.source.state.repo}
				/>
			</div>
		) : (
			<RequiresSetupBadge node={node} />
		);
	}

	return null;
}
