import type { Node } from "@giselle-sdk/data-type";
import { isJsonContent, jsonContentToText } from "@giselle-sdk/text-editor";
import clsx from "clsx/lite";
import { TrashIcon } from "lucide-react";
import pluralize from "pluralize";
import { type ReactNode, useMemo } from "react";
import { GeneratedContentIcon, PdfFileIcon, PromptIcon } from "../../../icons";
import { EmptyState } from "../../../ui/empty-state";
import { NodeDropdown } from "../ui/node-dropdown";

function SourceListRoot({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-[8px]">
			<p className="text-[14px]">{title}</p>
			{children}
		</div>
	);
}
function SourceListItem({
	icon,
	title,
	subtitle,
	onRemove,
}: {
	icon: ReactNode;
	title: string;
	subtitle: string;
	onRemove: () => void;
}) {
	return (
		<div
			className={clsx(
				"group flex items-center",
				"border border-white/20 rounded-[8px] h-[60px]",
			)}
		>
			<div className="w-[60px] flex items-center justify-center">{icon}</div>
			<div className="w-[1px] h-full border-l border-white/20" />
			<div className="px-[16px] flex-1 flex items-center justify-between">
				<div className="flex flex-col gap-[4px]">
					<p className="text=[16px]">{title}</p>
					<div className="text-[10px] text-black-40">
						<p className="line-clamp-1">{subtitle}</p>
					</div>
				</div>
				<button
					type="button"
					className={clsx(
						"hidden group-hover:block",
						"p-[4px] rounded-[4px]",
						"bg-transparent hover:bg-black-30/50 transition-colors",
					)}
					onClick={onRemove}
				>
					<TrashIcon className="w-[18px] h-[18px] text-white" />
				</button>
			</div>
		</div>
	);
}

export function SourcesPanel({
	sourceNodes,
	connectableNodes,
	addSource,
	removeSource,
}: {
	sourceNodes: Node[];
	connectableNodes: Node[];
	addSource: (node: Node) => void;
	removeSource: (node: Node) => void;
}) {
	const generatedSources = useMemo(
		() => sourceNodes.filter((sourceNode) => sourceNode.type === "action"),
		[sourceNodes],
	);

	const variableSources = useMemo(
		() => sourceNodes.filter((sourceNode) => sourceNode.type === "variable"),
		[sourceNodes],
	);

	if (sourceNodes.length === 0) {
		return (
			<div className="mt-[60px]">
				<EmptyState
					title="No data referenced yet."
					description="Select the data you want to refer to from the output and the information and knowledge you have."
				>
					<NodeDropdown
						nodes={connectableNodes}
						onValueChange={(node) => {
							addSource(node);
						}}
					/>
				</EmptyState>
			</div>
		);
	}
	return (
		<div>
			<div className="flex justify-end">
				<NodeDropdown
					nodes={connectableNodes}
					onValueChange={(node) => {
						addSource(node);
					}}
				/>
			</div>
			<div className="flex flex-col gap-[32px]">
				{generatedSources.length > 0 && (
					<SourceListRoot title="Generated Sources">
						{generatedSources.map((source) => (
							<SourceListItem
								icon={
									<GeneratedContentIcon className="size-[24px] text-white" />
								}
								key={source.id}
								title="Output"
								subtitle={`${source.content.llm.model} - ${source.content.llm.provider}`}
								onRemove={() => removeSource(source)}
							/>
						))}
					</SourceListRoot>
				)}
				{variableSources.length > 0 && (
					<SourceListRoot title="Static Contents">
						{variableSources.map((source) => {
							switch (source.content.type) {
								case "text": {
									const jsonContentLikeString = JSON.parse(source.content.text);
									const text = isJsonContent(jsonContentLikeString)
										? jsonContentToText(jsonContentLikeString)
										: source.content.text;

									return (
										<SourceListItem
											icon={<PromptIcon className="size-[24px] text-white" />}
											key={source.id}
											title={source.name ?? "Plain text"}
											subtitle={text}
											// subtitle="Sonar is insanely fast, no LLM comes even close to its speed. I just tested it out by comparing with Llama on t3 chat (fastest AI chat app). Even while having a head-start Llama lost by a huge margin. I have not seen anything this fast and this fascinates me. Further details in original post attached.g"
											onRemove={() => removeSource(source)}
										/>
									);
								}
								case "file":
									return (
										<SourceListItem
											icon={<PdfFileIcon className="size-[24px] text-white" />}
											key={source.id}
											title={source.name ?? "PDF Files"}
											subtitle={`${source.content.files.length} ${pluralize("file", source.content.files.length)}`}
											// subtitle="Sonar is insanely fast, no LLM comes even close to its speed. I just tested it out by comparing with Llama on t3 chat (fastest AI chat app). Even while having a head-start Llama lost by a huge margin. I have not seen anything this fast and this fascinates me. Further details in original post attached.g"
											onRemove={() => removeSource(source)}
										/>
									);
								default: {
									const _exhaustiveCheck: never = source.content;
									throw new Error(`Unhandled source type: ${_exhaustiveCheck}`);
								}
							}
						})}
					</SourceListRoot>
				)}
			</div>
		</div>
	);
}
