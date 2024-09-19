"use client";

import { GiselleLogo } from "@/components/giselle-logo";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import {
	ChevronUpIcon,
	FileCode2Icon,
	FileSearchIcon,
	FlagTriangleRightIcon,
	HandIcon,
	MousePointer2Icon,
	SparkleIcon,
	SparklesIcon,
	TextIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import bg from "./bg.png";
import { NodeSelector } from "./components/node-selector";
import "@xyflow/react/dist/style.css";
import { DnDProvider } from "./contexts/drag-and-drop";

const GradientBorder: FC = () => (
	<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
);

function Inner() {
	const [previewMode, setPreviewMode] = useState(false);
	return (
		<div className="w-full h-screen">
			<div className="absolute z-10 left-[20px] right-[20px] top-[20px] h-[36px] flex justify-between">
				<div className="flex gap-[8px] items-center">
					<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
					<div className="font-rosart text-[18px] text-black--30">
						Playground
					</div>
					<div className="flex items-center gap-[10px] group">
						<label className="w-[30px] h-[18px] border border-black-70 rounded-full relative bg-black-80 cursor-pointer group has-[:checked]:bg-black-70 ">
							<div className="absolute bg-black-100 rounded-full w-[16px] h-[16px] group-has-[:checked]:translate-x-[12px]  transition-all" />
							<input type="checkbox" name="previewMode" className="hidden" />
						</label>
						<div className="relative font-avenir h-[18px] text-[12px]">
							<div className="h-[18px] flex items-center absolute top-0 text-black--30 opacity-100 group-has-[:checked]:opacity-0 transition-opacity duration-400">
								Edit
							</div>
							<div className="h-[18px] flex items-center  absolute text-black--30 opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-400">
								Preview
							</div>
						</div>
					</div>
				</div>
			</div>
			<ReactFlow>
				<Background
					className="!bg-black-100"
					lineWidth={0}
					variant={BackgroundVariant.Lines}
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				/>

				<Panel position={"bottom-center"}>
					<div className="relative rounded-[8px] overflow-hidden bg-[hsla(233,26%,21%,0.6)]">
						<GradientBorder />
						<div className="z-10 flex divide-x divide-[hsla(222,21%,40%,1)] items-stretch">
							<div className="grid divide-y h-full">
								<button
									type="button"
									className="hover:bg-rosepine-highlightLow flex justify-center items-center p-1"
								>
									<MousePointer2Icon size={24} strokeWidth={1} />
								</button>

								<button
									type="button"
									className="hover:bg-rosepine-highlightLow flex justify-center items-center p-1"
								>
									<HandIcon size={24} strokeWidth={1} />
								</button>
							</div>
							<div className="flex items-center px-2">
								<div className="flex gap-2 text-sm">
									<Popover>
										<PopoverTrigger className="rounded  hover:bg-rosepine-highlightLow px-3 py-2 border border-rosepine-highlightMed flex items-center gap-2">
											<span>Action</span>
											<ChevronUpIcon size={14} strokeWidth={1} />
										</PopoverTrigger>
										<PopoverContent sideOffset={24}>
											<div className="flex gap-6">
												<NodeSelector
													className="[&_div.iconBase]:bg-rosepine-foam/20 [&_div.iconWrap]:bg-rosepine-foam/60 [&_div.iconMain]:fill-rosepine-foam/10 [&_div.iconMain]:text-rosepine-surface"
													nodeClassName="text-generation"
													icon={
														<SparkleIcon
															size={24}
															strokeWidth={2}
															className="fill-rosepine-foam/10 text-white"
														/>
													}
													label={
														<div>
															Text
															<br />
															Generation
														</div>
													}
												/>
												<NodeSelector
													nodeClassName="knowledge-retrieval"
													className="[&_div.iconBase]:bg-rosepine-foam/20 [&_div.iconWrap]:bg-rosepine-foam/60 [&_div.iconMain]:fill-rosepine-foam/10 [&_div.iconMain]:text-rosepine-surface"
													icon={
														<FileSearchIcon
															size={24}
															strokeWidth={2}
															className="fill-rosepine-foam/10 text-white"
														/>
													}
													label={
														<div>
															Knowledge
															<br />
															Retrieval
														</div>
													}
												/>
												<NodeSelector
													className="[&_div.iconBase]:bg-rosepine-foam/20 [&_div.iconWrap]:bg-rosepine-foam/60 [&_div.iconMain]:fill-rosepine-foam/10 [&_div.iconMain]:text-rosepine-surface"
													nodeClassName="web-scraping"
													icon={
														<FileCode2Icon
															size={24}
															strokeWidth={2}
															className="fill-rosepine-foam/10 text-white"
														/>
													}
													label={
														<div>
															Web
															<br />
															Scraping
														</div>
													}
												/>

												<NodeSelector
													className="[&_div.iconBase]:bg-rosepine-foam/20 [&_div.iconWrap]:bg-rosepine-foam/60 [&_div.iconMain]:fill-rosepine-foam/10 [&_div.iconMain]:text-rosepine-surface"
													nodeClassName="agent"
													icon={
														<SparklesIcon
															size={24}
															strokeWidth={2}
															className="fill-rosepine-foam/10 text-white"
														/>
													}
													label={<div>Agent</div>}
												/>
											</div>
										</PopoverContent>
									</Popover>

									<Popover>
										<PopoverTrigger className="rounded  hover:bg-rosepine-highlightLow px-3 py-2 border border-rosepine-highlightMed flex items-center gap-2">
											<span>Data</span>
											<ChevronUpIcon size={14} strokeWidth={1} />
										</PopoverTrigger>
										<PopoverContent sideOffset={24}>
											<div className="flex gap-6">
												<NodeSelector
													nodeClassName="text-generation"
													className="[&_div.iconBase]:bg-rosepine-gold/20 [&_div.iconWrap]:bg-rosepine-gold/60 [&_div.iconMain]:fill-rosepine-gold/10 [&_div.iconMain]:text-rosepine-surface"
													icon={
														<TextIcon
															size={24}
															strokeWidth={2}
															className="fill-rosepine-gold/10 text-white"
														/>
													}
													label={<div>Text</div>}
												/>
											</div>
										</PopoverContent>
									</Popover>
									<Popover>
										<PopoverTrigger className="rounded  hover:bg-rosepine-highlightLow px-3 py-2 border border-rosepine-highlightMed flex items-center gap-2">
											<span>Result</span>
											<ChevronUpIcon size={14} strokeWidth={1} />
										</PopoverTrigger>
										<PopoverContent sideOffset={24}>
											<div className="flex gap-6">
												<NodeSelector
													nodeClassName="text-generation"
													className="[&_div.iconBase]:bg-rosepine-iris/20 [&_div.iconWrap]:bg-rosepine-iris/60 [&_div.iconMain]:fill-rosepine-iris/10 [&_div.iconMain]:text-rosepine-surface"
													icon={
														<FlagTriangleRightIcon
															size={24}
															strokeWidth={2}
															className="fill-rosepine-iris/10 text-white"
														/>
													}
													label={<div>Response</div>}
												/>
											</div>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>
					</div>
				</Panel>
			</ReactFlow>
		</div>
	);
}

export default function Page() {
	return (
		<ReactFlowProvider>
			<DnDProvider>
				<Inner />
			</DnDProvider>
		</ReactFlowProvider>
	);
}
