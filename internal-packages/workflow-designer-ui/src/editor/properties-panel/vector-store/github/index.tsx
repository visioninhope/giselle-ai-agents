import type { VectorStoreNode } from "@giselle-sdk/data-type";
import {
	useVectorStore,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import Link from "next/link";
import { TriangleAlert } from "../../../../icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../ui/select";
import { useGitHubVectorStoreStatus } from "../../../lib/use-github-vector-store-status";

type GitHubVectorStoreNodePropertiesPanelProps = {
	node: VectorStoreNode;
};

export function GitHubVectorStoreNodePropertiesPanel({
	node,
}: GitHubVectorStoreNodePropertiesPanelProps) {
	const { updateNodeDataContent } = useWorkflowDesigner();
	const vectorStore = useVectorStore();
	const github = vectorStore?.github;
	const settingPath = vectorStore?.settingPath;
	const vectorStoreInfos = github ?? [];

	const { isOrphaned, repositoryId } = useGitHubVectorStoreStatus(node);

	const handleRepositoryChange = (selectedId: string) => {
		const selectedInfo = vectorStoreInfos.find(
			(info) => info.id === selectedId,
		);
		if (selectedInfo) {
			updateNodeDataContent(node, {
				...node.content,
				source: {
					...node.content.source,
					state: {
						status: "configured",
						owner: selectedInfo.reference.owner,
						repo: selectedInfo.reference.repo,
					},
				},
			});
		}
	};

	return (
		<div className="flex flex-col gap-[17px] p-0">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">
					GitHub Repository
				</p>
				{isOrphaned && node.content.source.state.status === "configured" && (
					<div className="flex items-center gap-[6px] text-error-900 text-[13px] mb-[8px]">
						<TriangleAlert className="size-[16px]" />
						<span>
							The repository{" "}
							<span className="font-mono font-semibold">
								{node.content.source.state.owner}/
								{node.content.source.state.repo}
							</span>{" "}
							is no longer available in your vector stores. Please select a
							different repository or set up this repository again.
						</span>
					</div>
				)}
				<Select value={repositoryId} onValueChange={handleRepositoryChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a repository" />
					</SelectTrigger>
					<SelectContent>
						{vectorStoreInfos.map((info) => (
							<SelectItem key={info.id} value={info.id}>
								{info.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{settingPath && (
					<div className="pt-[8px]">
						<Link
							href={settingPath}
							className="text-blue-600 hover:text-blue-500 text-[14px] hover:underline"
						>
							Set Up GitHub Vector Store →
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
