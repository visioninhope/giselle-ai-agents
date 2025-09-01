import { NodeId } from "@giselle-sdk/data-type";
import type { NodeProps as RFNodeProps } from "@xyflow/react";
import clsx from "clsx";
import { shallow } from "zustand/shallow";
import { useEditorStoreWithEqualityFn } from "../../store/context";

export function Node({ id }: RFNodeProps) {
	const node = useEditorStoreWithEqualityFn(
		(s) => s.nodesById[NodeId.parse(id)],
		shallow,
	);
	return (
		<div
			className={clsx(
				"group relative flex flex-col rounded-[16px] py-[16px] gap-[16px] min-w-[180px]",
				"bg-gradient-to-tl transition-all backdrop-blur-[4px]",
				node.content.type === "textGeneration" &&
					"from-generation-node-1] to-generation-node-2 shadow-generation-node-1",
			)}
		>
			<div
				className={clsx(
					"absolute z-0 rounded-[16px] inset-0 border-[1px] mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder",
					"border-transparent",
					node.content.type === "textGeneration" &&
						"from-generation-node-1/40 to-generation-node-1",
					// requiresSetup
					// 	? "border-black/60 border-dashed [border-width:2px]"
					// 	: "border-transparent",
					// "group-data-[content-type=text]:from-text-node-1/40 group-data-[content-type=text]:to-text-node-1",
					// "group-data-[content-type=file]:from-file-node-1/40 group-data-[content-type=file]:to-file-node-1",
					// "group-data-[content-type=webPage]:from-webPage-node-1/40 group-data-[content-type=webPage]:to-webPage-node-1",
					// "group-data-[content-type=textGeneration]:from-generation-node-1/40 group-data-[content-type=textGeneration]:to-generation-node-1",
					// "group-data-[content-type=imageGeneration]:from-image-generation-node-1/40 group-data-[content-type=imageGeneration]:to-image-generation-node-1",
					// "group-data-[content-type=github]:from-github-node-1/40 group-data-[content-type=github]:to-github-node-1",
					// "group-data-[content-type=vectorStore]:group-data-[vector-store-source-provider=github]:from-github-node-1/40 group-data-[content-type=vectorStore]:group-data-[vector-store-source-provider=github]:to-github-node-1",
					// "group-data-[content-type=vectorStore]:group-data-[vector-store-source-provider=githubPullRequest]:from-github-node-1/40 group-data-[content-type=vectorStore]:group-data-[vector-store-source-provider=githubPullRequest]:to-github-node-1",
					// "group-data-[content-type=webSearch]:from-web-search-node-1/40 group-data-[content-type=webSearch]:to-web-search-node-1",
					// "group-data-[content-type=audioGeneration]:from-audio-generation-node-1/40 group-data-[content-type=audioGeneration]:to-audio-generation-node-1",
					// "group-data-[content-type=videoGeneration]:from-video-generation-node-1/40 group-data-[content-type=videoGeneration]:to-video-generation-node-1",
					// "group-data-[content-type=trigger]:from-trigger-node-1/60 group-data-[content-type=trigger]:to-trigger-node-1",
					// "group-data-[content-type=action]:from-action-node-1/40 group-data-[content-type=action]:to-action-node-1",
					// "group-data-[content-type=query]:from-query-node-1/40 group-data-[content-type=query]:to-query-node-1",
				)}
			/>
			{node.name}
		</div>
	);
}
