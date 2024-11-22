import clsx from "clsx/lite";
import { useState } from "react";
import { CirclePlusIcon } from "../../beta-proto/components/icons/circle-plus";
import { PanelCloseIcon } from "../../beta-proto/components/icons/panel-close";
import { PanelOpenIcon } from "../../beta-proto/components/icons/panel-open";
import { useGraph, useNode } from "../contexts/graph";
import { useGraphSelection } from "../contexts/graph-selection";
import type { Node, TextGenerateActionContent, TextGeneration } from "../types";
import { ContentTypeIcon } from "./content-type-icon";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./properties-panel-dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "./properties-panel-popover";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "./properties-panel-tabs";

export function PropertiesPanel() {
	const { selectedNode } = useGraphSelection();
	const [show, setShow] = useState(false);
	return (
		<div
			className={clsx(
				"absolute bg-black-100 rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[0px] right-[20px] mt-[60px]",
				"data-[state=show]:w-[380px] data-[state=show]:bottom-[20px]",
			)}
			data-state={show ? "show" : "hidden"}
		>
			<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />

			{show ? (
				<Tabs>
					<div className="relative z-10 flex justify-between items-center pl-[16px] pr-[24px] py-[10px] h-[56px]">
						<button
							type="button"
							onClick={() => setShow(false)}
							className="p-[8px]"
						>
							<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
						</button>
						<TabsList>
							{selectedNode?.content?.type === "textGeneration" && (
								<>
									<TabsTrigger value="Prompt">Prompt</TabsTrigger>
									<TabsTrigger value="LLM">LLM</TabsTrigger>
									<TabsTrigger value="Result">Result</TabsTrigger>
								</>
							)}
						</TabsList>
					</div>

					{selectedNode && (
						<div className="bg-black-80 px-[24px] py-[8px] flex items-center justify-between">
							<div className="flex items-center gap-[8px]">
								<div
									data-type={selectedNode.type}
									className={clsx(
										"rounded-[2px] flex items-center justify-center px-[4px] py-[4px]",
										"data-[type=action]:bg-[hsla(187,71%,48%,1)]",
										"data-[type=variable]:bg-white",
									)}
								>
									<ContentTypeIcon
										contentType={selectedNode.content.type}
										className="w-[14px] h-[14px] fill-black-100"
									/>
								</div>
								<div className="font-avenir text-[16px] text-black-30">
									{selectedNode.content.type}
								</div>
							</div>
							<div className="">
								<button
									type="button"
									className="relative z-10 rounded-[8px] shadow-[0px_0px_3px_0px_#FFFFFF40_inset] py-[4px] px-[8px] bg-black-80 text-black-30 font-rosart text-[14px] disabled:bg-black-40"
								>
									Generate
								</button>
							</div>
						</div>
					)}

					{selectedNode?.content?.type === "textGeneration" && (
						<TabsContent value="Prompt">
							<TabsContentPrompt
								content={selectedNode.content}
								key={selectedNode.id}
							/>
						</TabsContent>
					)}
					<TabsContent value="LLM">hello</TabsContent>
					<TabsContent value="Result">hello</TabsContent>
				</Tabs>
			) : (
				<div className="relative z-10 flex justify-between items-center">
					<button
						type="button"
						onClick={() => setShow(true)}
						className="p-[16px]"
					>
						<PanelOpenIcon className="w-[18px] h-[18px] fill-black-30" />
					</button>
				</div>
			)}
		</div>
	);
}

function TabsContentPrompt({
	content,
}: {
	content: TextGenerateActionContent;
}) {
	const { nodes } = useGraph();
	const requirementableNodes = nodes.filter(
		(node) =>
			node.content.type === "text" || node.content.type === "textGeneration",
	);
	const requirementNode = useNode({
		targetNodeHandleId: content.requirement?.id,
	});
	return (
		<div className="relative z-10 flex flex-col gap-[10px]">
			<div className="grid gap-[8px] pb-[14px]">
				<label htmlFor="text" className="font-rosart text-[16px] text-black-30">
					Instruction
				</label>
				<textarea
					name="text"
					id="text"
					className="w-full text-[14px] h-[200px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none"
				/>
			</div>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<div className="grid gap-[8px]">
				<div className="flex justify-between">
					<div className="font-rosart text-[16px] text-black-30">
						Requirement
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger />
						<DropdownMenuContent>
							<DropdownMenuRadioGroup>
								<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
								<DropdownMenuRadioItem value="nd_1">
									Untitle Node - 1
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="nd_2">
									Untitle Node - 2
								</DropdownMenuRadioItem>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Text</DropdownMenuLabel>
								<DropdownMenuRadioItem value="nd_3">
									Untitled Node - 7
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{requirementNode === null ? (
					<div className="text-[12px] text-black-40">
						This prompt has no requirement.
					</div>
				) : (
					<div>{requirementNode.name}</div>
				)}
			</div>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<div className="grid gap-[8px]">
				<div className="flex justify-between">
					<div className="font-rosart text-[16px] text-black-30">Sources</div>

					<Popover>
						<PopoverTrigger />
						<PopoverContent />
						{/* <div className="px-[8px]">ii</div> */}
					</Popover>
				</div>
			</div>
			{/* <div className="grid gap-[8px]">
								<div className="flex justify-between">
									<div className="font-rosart text-[16px] text-black-30">
										Sources
									</div>
									<div className="flex items-center gap-[4px]">
										<AddSourceDialog node={node} />
										<Popover.Root>
											<Popover.Trigger asChild>
												<button type="button">
													<CirclePlusIcon
														size={20}
														className="stroke-black-100 fill-black-30"
													/>
												</button>
											</Popover.Trigger>
											<Popover.Content
												side={"top"}
												align="end"
												className="rounded-[16px] p-[8px] text-[14px] w-[200px] text-black-30 bg-black-100 border border-[hsla(222,21%,40%,1)] shadow-[0px_0px_2px_0px_hsla(0,_0%,_100%,_0.1)_inset] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
												sideOffset={5}
											>
												<div className="px-[8px]">
													<div>
														{availableArtifactsOrWebSearches.map(
															(artifactOrWebSearch) =>
																artifactOrWebSearch.object === "artifact" ? (
																	<button
																		type="button"
																		className="flex justify-between items-center py-[4px] w-full"
																		key={artifactOrWebSearch.id}
																		onClick={handleArtifactClick(
																			artifactOrWebSearch,
																		)}
																	>
																		<p className="line-clamp-1 text-left">
																			{artifactOrWebSearch.title}
																		</p>
																		{sources.some(
																			(source) =>
																				source.id === artifactOrWebSearch.id,
																		) && (
																			<CheckIcon
																				size={16}
																				className="stroke-white flex-shrink-0"
																			/>
																		)}
																	</button>
																) : (
																	<button
																		type="button"
																		className="flex justify-between items-center py-[4px] w-full"
																		key={artifactOrWebSearch.id}
																		onClick={handleWebSearchClick(
																			artifactOrWebSearch,
																		)}
																	>
																		<p className="line-clamp-1 text-left">
																			{artifactOrWebSearch.name}
																		</p>
																		{sources.some(
																			(source) =>
																				source.id === artifactOrWebSearch.id,
																		) && (
																			<CheckIcon
																				size={16}
																				className="stroke-white flex-shrink-0"
																			/>
																		)}
																	</button>
																),
														)}
													</div>
												</div>
											</Popover.Content>
										</Popover.Root>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									{sources.map((source) =>
										source.object === "artifact" ? (
											<ArtifactBlock
												key={source.id}
												title={source.title}
												node={source.generatorNode}
												content={source.content}
												completed={true}
											/>
										) : source.object === "file" ? (
											<Block
												key={source.id}
												title={source.name}
												description={
													source.status === "uploading"
														? "Uploading..."
														: source.status === "processing"
															? "Processing..."
															: source.status === "processed"
																? "Ready"
																: "Pending"
												}
												icon={
													<DocumentIcon className="w-[18px] h-[18px] fill-black-30 flex-shrink-0" />
												}
											/>
										) : source.object === "webSearch" ? (
											<Block
												key={source.id}
												title={source.name}
												icon={
													<TextsIcon className="w-[18px] h-[18px] fill-black-30 flex-shrink-0" />
												}
											/>
										) : (
											<Block
												key={source.id}
												title={source.title}
												icon={
													<TextsIcon className="w-[18px] h-[18px] fill-black-30 flex-shrink-0" />
												}
												onDelete={removeTextContent({ id: source.id })}
											/>
										),
									)}
								</div>
							</div> */}
		</div>
	);
}
