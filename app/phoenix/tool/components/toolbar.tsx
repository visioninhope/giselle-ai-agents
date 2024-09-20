import {
	ChevronUpIcon,
	FileCode2Icon,
	FileSearchIcon,
	HandIcon,
	MousePointer2Icon,
	TextIcon,
} from "lucide-react";
import { type FC, type PropsWithChildren, forwardRef } from "react";
import { TextGenerationIcon } from "../../components/icons/text-generation";
import { WillisIcon } from "../../components/icons/willis";
import { ListItem } from "../../components/list-item";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../../components/popover";
import { ToolSelectOption } from "./tool-select-option";

export const GradientBorder: FC = () => (
	<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
);

const ToolbarButton = forwardRef<HTMLButtonElement, PropsWithChildren>(
	(props, ref) => (
		<button
			type="button"
			className="rounded-[8px] border-[0.5px] border-[hsla(207,19%,77%,0.3)] h-[32px] px-[8px] flex items-center gap-[6px] hover:border-[hsla(207,19%,77%,1)] data-[state=open]:border-[1px] data-[state=open]:border-black-30"
			ref={ref}
			{...props}
		/>
	),
);

export const Toolbar: FC = () => (
	<div className="relative rounded-[8px] overflow-hidden bg-[hsla(233,26%,21%,0.6)]">
		<GradientBorder />
		<div className="flex divide-x divide-[hsla(222,21%,40%,1)] items-center h-[56px]">
			<div className="flex justify-center items-center z-10 h-full p-[16px]">
				<Popover>
					<PopoverTrigger asChild>
						<button type="button" className="flex items-center gap-[7px]">
							<MousePointer2Icon size={24} strokeWidth={1} />
							<ChevronUpIcon size={14} strokeWidth={1} />
						</button>
					</PopoverTrigger>
					<PopoverContent sideOffset={24}>
						<div className="grid">
							<ListItem
								icon={<MousePointer2Icon size={16} strokeWidth={1} />}
								title="Move"
							/>
							<ListItem
								icon={<HandIcon size={16} strokeWidth={1} />}
								title="Hand"
							/>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex items-center px-2 z-10 h-full">
				<div className="flex gap-[4px] p-[4px] rounded-[8px] text-sm bg-[hsla(0,0%,69%,0.1)]">
					<Popover>
						<PopoverTrigger asChild>
							<ToolbarButton>
								<span>Action</span>
								<ChevronUpIcon size={14} strokeWidth={1} />
							</ToolbarButton>
						</PopoverTrigger>
						<PopoverContent sideOffset={24}>
							<div className="grid">
								<ToolSelectOption
									tool={{
										type: "add-text-generation-node",
									}}
									icon={
										<TextGenerationIcon className="fill-black-30 w-[16px] h-[16px]" />
									}
									label="Text Generation"
								/>
								<ToolSelectOption
									tool={{
										type: "add-knowledge-retrieval-node",
									}}
									icon={
										<FileSearchIcon
											size={16}
											strokeWidth={2}
											className="text-black-30"
										/>
									}
									label="Knowledge Retrieval"
								/>
								<ToolSelectOption
									tool={{
										type: "add-web-scraping-node",
									}}
									icon={
										<FileCode2Icon
											size={16}
											strokeWidth={2}
											className="text-black-30"
										/>
									}
									label="Web Scraping"
								/>
							</div>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger asChild>
							<ToolbarButton>
								<span>Data</span>
								<ChevronUpIcon size={14} strokeWidth={1} />
							</ToolbarButton>
						</PopoverTrigger>
						<PopoverContent sideOffset={24}>
							<div className="flex gap-6">
								<ToolSelectOption
									tool={{
										type: "add-text-node",
									}}
									icon={
										<TextIcon
											size={16}
											strokeWidth={1}
											className="text-black-30"
										/>
									}
									label="Text"
								/>
							</div>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger asChild>
							<ToolbarButton>
								<span>Agent</span>
								<ChevronUpIcon size={14} strokeWidth={1} />
							</ToolbarButton>
						</PopoverTrigger>
						<PopoverContent sideOffset={24}>
							<div className="flex gap-6">
								<ToolSelectOption
									tool={{
										type: "add-agent-node",
										agentId: "willis",
									}}
									icon={
										<WillisIcon className="fill-black-30 w-[16px] h-[16px]" />
									}
									label="Kansai Agent"
								/>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	</div>
);
