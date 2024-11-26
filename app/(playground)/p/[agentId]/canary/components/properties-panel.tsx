import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { readStreamableValue } from "ai/rsc";
import clsx from "clsx/lite";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	DotIcon,
	Minimize2Icon,
	TrashIcon,
} from "lucide-react";
import {
	type ComponentProps,
	type FC,
	type HTMLAttributes,
	type ReactNode,
	useMemo,
	useState,
} from "react";
import { DocumentIcon } from "../../beta-proto/components/icons/document";
import { PanelCloseIcon } from "../../beta-proto/components/icons/panel-close";
import { PanelOpenIcon } from "../../beta-proto/components/icons/panel-open";
import { WilliIcon } from "../../beta-proto/components/icons/willi";
import { generateTextArtifactStream } from "../actions";
import { useArtifact, useGraph, useNode } from "../contexts/graph";
import { useGraphSelection } from "../contexts/graph-selection";
import { usePropertiesPanel } from "../contexts/properties-panel";
import type { Node, Text, TextGenerateActionContent } from "../types";
import { createArtifactId } from "../utils";
import { Block } from "./block";
import { ContentTypeIcon } from "./content-type-icon";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./select";
import { Slider } from "./slider";

interface PropertiesPanelCollapsible {
	title: string;
	glanceLabel?: string;
	children: ReactNode;
}

function PropertiesPanelCollapsible({
	title,
	glanceLabel,
	children,
}: PropertiesPanelCollapsible) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			{isExpanded ? (
				<div className="px-[24px] text-base text-black-30 py-[8px] grid gap-2">
					<div className="flex justify-between items-center">
						<p className="font-rosart">{title}</p>
						<button type="button" onClick={() => setIsExpanded(false)}>
							<Minimize2Icon
								size={16}
								className="text-black-50 hover:text-black-30"
							/>
						</button>
					</div>
					{children}
				</div>
			) : (
				<button
					type="button"
					className="px-[24px] text-base text-black-30 flex justify-between items-center py-[8px] group"
					onClick={() => setIsExpanded(true)}
				>
					<div className="flex gap-2 items-center">
						<p className="font-rosart">{title}</p>
						{glanceLabel && (
							<span className="text-[10px] text-black-50">{glanceLabel}</span>
						)}
					</div>
					<ChevronsUpDownIcon
						size={16}
						className="text-black-50 group-hover:text-black-30"
					/>
				</button>
			)}
		</>
	);
}

const DropdownMenu = DropdownMenuPrimitive.Root;

function DropdownMenuTrigger({ label = "Select" }: { label?: string }) {
	return (
		<DropdownMenuPrimitive.Trigger className="text-[12px] px-[8px] py-[0.5px] border border-black-50 rounded-[4px]">
			{label}
		</DropdownMenuPrimitive.Trigger>
	);
}

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuContent({ children }: { children: React.ReactNode }) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				sideOffset={4}
				align="end"
				className={clsx(
					"z-50 min-w-[8rem] overflow-hidden rounded-[16px] border border-black-70 bg-black-100 p-[8px] text-black-30 shadow-[0px_0px_2px_0px_hsla(0,_0%,_100%,_0.1)_inset]",
					"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				)}
			>
				{children}
			</DropdownMenuPrimitive.Content>
		</DropdownMenuPrimitive.Portal>
	);
}
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

function DropdownMenuCheckboxItem({
	children,
	checked = false,
}: {
	children: React.ReactNode;
	checked?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			checked={checked}
		>
			{children}
			<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="h-4 w-4" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
		</DropdownMenuPrimitive.CheckboxItem>
	);
}
DropdownMenuCheckboxItem.displayName =
	DropdownMenuPrimitive.CheckboxItem.displayName;

function DropdownMenuLabel({ children }: { children: ReactNode }) {
	return (
		<DropdownMenuPrimitive.Label className="px-2 py-[2px] text-[12px] text-black-70">
			{children}
		</DropdownMenuPrimitive.Label>
	);
}
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

function DropdownMenuSeparator() {
	return (
		<DropdownMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-muted" />
	);
}
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

function DropdownMenuRadioItem({
	children,
	value,
}: {
	children: ReactNode;
	value: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>["value"];
}) {
	return (
		<DropdownMenuPrimitive.RadioItem
			className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			value={value}
		>
			<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<DotIcon className="h-8 w-8 fill-current" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
}
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

function HoverCardContent({
	className,
	align = "center",
	sideOffset = 4,
	side = "left",
	...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
	return (
		<HoverCardPrimitive.Content
			align={align}
			side={side}
			sideOffset={sideOffset}
			className="z-50 w-64 rounded-[16px] border border-black-70 bg-black-100 p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
			{...props}
		/>
	);
}
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

const Tabs = TabsPrimitive.Root;

function TabsList(props: ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List className="gap-[16px] flex items-center" {...props} />
	);
}
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger: FC<ComponentProps<typeof TabsPrimitive.Trigger>> = ({
	ref,
	className,
	...props
}) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className="font-rosart text-[16px] text-black-70 data-[state=active]:text-black-30 py-[6px] px-[2px]"
		{...props}
	/>
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent: FC<ComponentProps<typeof TabsPrimitive.Content>> = ({
	ref,
	...props
}) => (
	<TabsPrimitive.Content
		ref={ref}
		className="overflow-y-auto overflow-x-hidden"
		{...props}
	/>
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay(props: ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className="fixed inset-0 z-50 bg-black-100/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
			{...props}
		/>
	);
}
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

function DialogContent({
	children,
	...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={clsx(
					"fixed left-[50%] top-[50%] z-50",
					"w-[800px] h-[90%] overflow-hidden translate-x-[-50%] translate-y-[-50%]",
					"px-[32px] py-[32px] flex",
					"font-rosart bg-black-100 rounded-[16px] shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset,0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)]",
					"duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
				)}
				{...props}
			>
				<div className="relative z-10 flex flex-col">{children}</div>
				<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader(props: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className="flex flex-col space-y-1.5 text-center sm:text-left"
			{...props}
		/>
	);
}
DialogHeader.displayName = "DialogHeader";

function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className="text-lg font-semibold leading-none tracking-tight"
			{...props}
		/>
	);
}

function DialogFooter(props: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className="flex flex-col space-y-1.5 text-center sm:text-left"
			{...props}
		/>
	);
}
DialogFooter.displayName = "DialogHeader";

export function PropertiesPanel() {
	const { dispatch } = useGraph();
	const { selectedNode } = useGraphSelection();
	const { open, setOpen, tab, setTab } = usePropertiesPanel();
	return (
		<div
			className={clsx(
				"absolute bg-black-100 rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[0px] right-[20px] mt-[60px]",
				"data-[state=show]:w-[380px] data-[state=show]:bottom-[20px]",
			)}
			data-state={open ? "show" : "hidden"}
		>
			<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />

			{open ? (
				<Tabs
					className="h-full overflow-y-hidden flex flex-col"
					value={tab}
					onValueChange={(v) => setTab(v)}
				>
					<div className="relative z-10 flex justify-between items-center pl-[16px] pr-[24px] py-[10px] h-[56px]">
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="p-[8px]"
						>
							<PanelCloseIcon className="w-[18px] h-[18px] fill-black-30" />
						</button>
						<TabsList>
							{selectedNode?.content?.type === "textGeneration" && (
								<>
									<TabsTrigger value="Prompt">Prompt</TabsTrigger>
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
									onClick={async () => {
										setTab("Result");
										const stream = await generateTextArtifactStream();

										const artifactId = createArtifactId();

										for await (const streamContent of readStreamableValue(
											stream,
										)) {
											if (streamContent === undefined) {
												continue;
											}
											dispatch({
												type: "upsertArtifact",
												input: {
													nodeId: selectedNode.id,
													artifact: {
														id: artifactId,
														type: "streamArtifact",
														creatorNodeId: selectedNode.id,
														object: streamContent,
													},
												},
											});
										}
									}}
								>
									Generate
								</button>
							</div>
						</div>
					)}

					{selectedNode?.content?.type === "textGeneration" && (
						<TabsContent value="Prompt" className="flex-1">
							<TabsContentPrompt
								content={selectedNode.content}
								key={selectedNode.id}
							/>
						</TabsContent>
					)}
					{selectedNode && (
						<TabsContent value="Result">
							<TabContentGenerateTextResult node={selectedNode} />
						</TabsContent>
					)}
				</Tabs>
			) : (
				<div className="relative z-10 flex justify-between items-center">
					<button
						type="button"
						onClick={() => setOpen(true)}
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
	const {
		graph: { nodes, connections },
	} = useGraph();
	const connectableTextNodes: Text[] = nodes
		.filter((node) => node.content.type === "text")
		.map((node) => node as Text);
	const connectableTextGeneratorNodes = nodes.filter(
		(node) => node.content.type === "textGeneration",
	);
	const connectableFileNodes = nodes.filter(
		(node) => node.content.type === "file",
	);
	const requirementNode = useNode({
		targetNodeHandleId: content.requirement?.id,
	});
	const sourceNodes = useMemo(
		() =>
			content.sources
				.map((source) => {
					const connection = connections.find(
						(connection) => connection.targetNodeHandleId === source.id,
					);
					const node = nodes.find(
						(node) => node.id === connection?.sourceNodeId,
					);
					return node;
				})
				.filter((node) => node !== undefined),
		[connections, content.sources, nodes],
	);
	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full">
			<PropertiesPanelCollapsible title="LLM" glanceLabel={content.llm}>
				<div className="flex flex-col gap-[10px]">
					<div className="grid gap-[8px]">
						<Select value={content.llm}>
							<SelectTrigger>
								<SelectValue placeholder="Select a LLM" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>OpenAI</SelectLabel>
									<SelectItem value="openai:gpt-4o">gpt-4o</SelectItem>
									<SelectItem value="openai:gpt-4o-mini">
										gpt-4o-mini
									</SelectItem>
								</SelectGroup>
								<SelectGroup>
									<SelectLabel>Anthropic </SelectLabel>
									<SelectItem value="anthropic:claude-3.5-sonnet">
										Claude 3.5 Sonnet
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-[8px]">
						<div className="font-rosart text-[16px] text-black-30">
							Parameters
						</div>
						<div className="grid gap-[16px]">
							<Slider
								label="Temperature"
								value={content.temperature}
								max={2.0}
								min={0.0}
								step={0.01}
							/>
						</div>
						<Slider
							label="Top P"
							value={content.topP}
							max={1.0}
							min={0.0}
							step={0.01}
						/>
					</div>
				</div>
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />
			<PropertiesPanelCollapsible
				title="Requirement"
				glanceLabel={
					requirementNode === null ? "Not selected" : requirementNode.name
				}
			>
				{requirementNode === null ? (
					<div className="flex items-center gap-[4px]">
						<div className="py-[4px] text-[12px] flex-1">Not selected</div>
						<DropdownMenu>
							<DropdownMenuTrigger />
							<DropdownMenuContent>
								<DropdownMenuRadioGroup>
									<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
									{connectableTextGeneratorNodes.map((node) => (
										<DropdownMenuRadioItem value={node.id} key={node.id}>
											{node.name}
										</DropdownMenuRadioItem>
									))}
									<DropdownMenuSeparator />
									<DropdownMenuLabel>Text</DropdownMenuLabel>
									{connectableTextNodes.map((node) => (
										<DropdownMenuRadioItem value={node.id} key={node.id}>
											{node.name}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<HoverCard>
						<HoverCardTrigger asChild>
							<Block>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-[8px]">
										<p className="truncate text-[14px] font-rosart">
											{requirementNode.name}
										</p>
									</div>
									<button
										type="button"
										className="group-hover:block hidden p-[2px] hover:bg-black-70 rounded-[4px]"
									>
										<TrashIcon className="w-[16px] h-[16px] text-black-30" />
									</button>
								</div>
							</Block>
						</HoverCardTrigger>
						<HoverCardContent className="w-80">
							<div className="flex justify-between space-x-4">
								{requirementNode.content.type === "text" && (
									<div className="line-clamp-5 text-[14px]">
										{requirementNode.content.text}
									</div>
								)}
							</div>
						</HoverCardContent>
					</HoverCard>
				)}
				{/* <div className="mb-[4px]">
					<Select value={requirementNode?.id}>
						<SelectTrigger>
							<SelectValue placeholder="Select a requirement" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Text Generator</SelectLabel>
								{connectableTextGeneratorNodes.map((node) => (
									<SelectItem value={node.id} key={node.id} label={node.name}>
										<p>it's a text generator</p>
									</SelectItem>
								))}
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Text</SelectLabel>
								{connectableTextNodes.map((node) => (
									<SelectItem value={node.id} key={node.id} label={node.name}>
										<p>{node.content.text}</p>
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div> */}
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<PropertiesPanelCollapsible
				title="Sources"
				glanceLabel={
					sourceNodes.length < 1
						? "No sources"
						: `${sourceNodes.length} sources selected`
				}
			>
				{sourceNodes.length < 1 ? (
					<div className="flex items-center gap-[4px]">
						<div className="py-[4px] text-[12px] flex-1">Not selected</div>
						<DropdownMenu>
							<DropdownMenuTrigger label="Add" />
							<DropdownMenuContent>
								<DropdownMenuRadioGroup>
									<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
									{connectableTextGeneratorNodes.map((node) => (
										<DropdownMenuRadioItem value={node.id} key={node.id}>
											{node.name}
										</DropdownMenuRadioItem>
									))}
									<DropdownMenuSeparator />
									<DropdownMenuLabel>Text</DropdownMenuLabel>
									{connectableTextNodes.map((node) => (
										<DropdownMenuRadioItem value={node.id} key={node.id}>
											{node.name}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<div className="grid gap-2">
						{sourceNodes.map((sourceNode) => (
							<HoverCard key={sourceNode.id}>
								<HoverCardTrigger asChild>
									<Block>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-[8px]">
												<p className="truncate text-[14px] font-rosart">
													{sourceNode.name}
												</p>
											</div>
											<button
												type="button"
												className="group-hover:block hidden p-[2px] hover:bg-black-70 rounded-[4px]"
											>
												<TrashIcon className="w-[16px] h-[16px] text-black-30" />
											</button>
										</div>
									</Block>
								</HoverCardTrigger>
								<HoverCardContent className="w-80">
									<div className="flex justify-between space-x-4">
										node type: {sourceNode.content.type}
										{sourceNode.content.type === "text" && (
											<div className="line-clamp-5 text-[14px]">
												{sourceNode.content.text}
											</div>
										)}
									</div>
								</HoverCardContent>
							</HoverCard>
						))}

						<div className="flex items-center gap-[4px]">
							<DropdownMenu>
								<DropdownMenuTrigger label="Add source" />
								<DropdownMenuContent>
									<DropdownMenuRadioGroup>
										<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
										{connectableTextGeneratorNodes.map((node) => (
											<DropdownMenuRadioItem value={node.id} key={node.id}>
												{node.name}
											</DropdownMenuRadioItem>
										))}
										<DropdownMenuSeparator />
										<DropdownMenuLabel>Text</DropdownMenuLabel>
										{connectableTextNodes.map((node) => (
											<DropdownMenuRadioItem value={node.id} key={node.id}>
												{node.name}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				)}
			</PropertiesPanelCollapsible>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<div className="flex flex-col gap-[8px] flex-1 pb-[24px] px-[24px] pt-[8px]">
				<label htmlFor="text" className="font-rosart text-[16px] text-black-30">
					Instruction
				</label>
				<textarea
					name="text"
					id="text"
					className="w-full text-[14px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[14px] font-rosart outline-none resize-none flex-1"
					defaultValue={content.instruction}
				/>
			</div>

			{/* <div className="grid gap-[8px]">
				<div className="flex justify-between">
					<div className="font-rosart text-[16px] text-black-30">
						Requirement
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger />
						<DropdownMenuContent>
							<DropdownMenuRadioGroup value={requirementNode?.id}>
								<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
								{connectableTextGeneratorNodes.map((node) => (
									<DropdownMenuRadioItem value={node.id} key={node.id}>
										{node.name}
									</DropdownMenuRadioItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Text</DropdownMenuLabel>
								{connectableTextNodes.map((node) => (
									<DropdownMenuRadioItem value={node.id} key={node.id}>
										{node.name}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{requirementNode === null ? (
					<div className="text-[12px] text-black-40 h-[36px]">
						This prompt has no requirement.
					</div>
				) : (
					// <Block
					// 	icon={
					// 		<ContentTypeIcon
					// 			contentType={requirementNode.content.type}
					// 			className="fill-white"
					// 		/>
					// 	}
					// 	title={requirementNode.name}
					// />
					<NodeBlock node={requirementNode} />
				)}
			</div>

			<div className="border-t border-[hsla(222,21%,40%,1)]" />

			<div className="grid gap-[8px]">
				<div className="flex justify-between">
					<div className="font-rosart text-[16px] text-black-30">Sources</div>
					<DropdownMenu>
						<DropdownMenuTrigger />
						<DropdownMenuContent>
							<DropdownMenuLabel>Text Generator</DropdownMenuLabel>
							{connectableTextGeneratorNodes.map((node) => (
								<DropdownMenuCheckboxItem
									checked={sourceNodes.some((source) => source.id === node.id)}
									key={node.id}
								>
									{node.name}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Text</DropdownMenuLabel>
							{connectableTextNodes.map((node) => (
								<DropdownMenuCheckboxItem
									checked={sourceNodes.some((source) => source.id === node.id)}
									key={node.id}
								>
									{node.name}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuLabel>File</DropdownMenuLabel>
							{connectableFileNodes.map((node) => (
								<DropdownMenuCheckboxItem
									checked={sourceNodes.some((source) => source.id === node.id)}
									key={node.id}
								>
									{node.name}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div> */}
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

/**
 * Formats a timestamp number into common English date string formats
 */
const formatTimestamp = {
	/**
	 * Format: Nov 25, 2024 10:30:45 AM
	 */
	toLongDateTime: (timestamp: number): string => {
		return new Date(timestamp).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
	},

	/**
	 * Format: 11/25/2024 10:30 AM
	 */
	toShortDateTime: (timestamp: number): string => {
		return new Date(timestamp).toLocaleString("en-US", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	},

	/**
	 * Format: November 25, 2024
	 */
	toLongDate: (timestamp: number): string => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	},

	/**
	 * Format: 11/25/2024
	 */
	toShortDate: (timestamp: number): string => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
	},

	/**
	 * Format: 10:30:45 AM
	 */
	toTime: (timestamp: number): string => {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
	},

	/**
	 * Format: ISO 8601 (2024-11-25T10:30:45Z)
	 * Useful for APIs and database storage
	 */
	toISO: (timestamp: number): string => {
		return new Date(timestamp).toISOString();
	},

	/**
	 * Returns relative time like "2 hours ago", "in 3 days", etc.
	 * Supports both past and future dates
	 */
	toRelativeTime: (timestamp: number): string => {
		const now = Date.now();
		const diff = timestamp - now;
		const absMs = Math.abs(diff);
		const isPast = diff < 0;

		// Time units in milliseconds
		const minute = 60 * 1000;
		const hour = 60 * minute;
		const day = 24 * hour;
		const week = 7 * day;
		const month = 30 * day;
		const year = 365 * day;

		// Helper function to format the time with proper pluralization
		const formatUnit = (value: number, unit: string): string => {
			const plural = value === 1 ? "" : "s";
			return isPast
				? `${value} ${unit}${plural} ago`
				: `in ${value} ${unit}${plural}`;
		};

		if (absMs < minute) {
			return isPast ? "just now" : "in a few seconds";
		}

		if (absMs < hour) {
			const mins = Math.floor(absMs / minute);
			return formatUnit(mins, "minute");
		}

		if (absMs < day) {
			const hrs = Math.floor(absMs / hour);
			return formatUnit(hrs, "hour");
		}

		if (absMs < week) {
			const days = Math.floor(absMs / day);
			return formatUnit(days, "day");
		}

		if (absMs < month) {
			const weeks = Math.floor(absMs / week);
			return formatUnit(weeks, "week");
		}

		if (absMs < year) {
			const months = Math.floor(absMs / month);
			return formatUnit(months, "month");
		}

		const years = Math.floor(absMs / year);
		return formatUnit(years, "year");
	},
};

function TabContentGenerateTextResult({
	node,
}: {
	node: Node;
}) {
	const artifact = useArtifact({ creatorNodeId: node.id });
	if (artifact === null) {
		return null;
	}
	if (artifact.object.type !== "text") {
		return null;
	}
	return (
		<div className="grid gap-[8px] font-rosart text-[12px] text-black-30 px-[24px] py-[8px] relative z-10">
			<div>{artifact.object.messages.plan}</div>

			{artifact.object.title !== "" && (
				<Dialog>
					<DialogTrigger>
						<Block size="large">
							<div className="flex items-center gap-[12px]">
								<DocumentIcon className="w-[18px] h-[18px] fill-black-30" />
								<div className="text-[14px]">{artifact.object.title}</div>
							</div>
						</Block>
					</DialogTrigger>
					<DialogContent>
						<div className="sr-only">
							<DialogHeader>
								<DialogTitle>{artifact.object.title}</DialogTitle>
							</DialogHeader>
						</div>
						<div className="flex-1">{artifact.object.content}</div>
						{artifact.type === "generatedArtifact" && (
							<DialogFooter className="text-[14px] font-bold text-black-70">
								Generated {formatTimestamp.toRelativeTime(artifact.createdAt)}
							</DialogFooter>
						)}
					</DialogContent>
				</Dialog>
			)}
			<div>{artifact.object.messages.description}</div>

			{artifact.type === "generatedArtifact" && (
				<div>
					<div className="inline-flex items-center gap-[6px] text-black-30/50 font-sans">
						<p className="italic">Generation completed.</p>
					</div>
				</div>
			)}
		</div>
	);
}
