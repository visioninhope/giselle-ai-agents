import { Button } from "@/components/ui/button";
import type {
	GitHubNextAction,
	GitHubTriggerEvent,
} from "@/services/external/github/types";
import * as Popover from "@radix-ui/react-popover";
import * as Tabs from "@radix-ui/react-tabs";
import { getDownloadUrl, head } from "@vercel/blob";
import clsx from "clsx/lite";
import {
	ArrowRightIcon,
	CirclePlusIcon,
	DownloadIcon,
	FrameIcon,
	GithubIcon,
	HammerIcon,
	ListTreeIcon,
	XIcon,
} from "lucide-react";
import Link from "next/link";
import {
	type ComponentProps,
	type ReactNode,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";
import { useAgentName } from "../contexts/agent-name";
import { useDeveloperMode } from "../contexts/developer-mode";
import { useGitHubIntegration } from "../contexts/github-integration";
import { useGraph } from "../contexts/graph";
import { LayersIcon } from "../prev/beta-proto/components/icons/layers";
import { WilliIcon } from "../prev/beta-proto/components/icons/willi";
import type { Node, Step } from "../types";
import { Block } from "./block";
import { ContentTypeIcon } from "./content-type-icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function TabsTrigger(
	props: Omit<ComponentProps<typeof Tabs.Trigger>, "className">,
) {
	return (
		<Tabs.Trigger
			className="w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[hsla(30,100%,98%,0.2)] data-[state=active]:bg-black-80"
			{...props}
		/>
	);
}

function TabsContent(
	props: Omit<ComponentProps<typeof Tabs.Content>, "className">,
) {
	return (
		<Tabs.Content
			className="absolute w-[400px] rounded-[24px] bg-[hsla(234,91%,5%,0.8)] overflow-hidden shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset] top-[0px] bottom-[20px] left-[84px] mt-[60px] backdrop-blur-[16px]"
			{...props}
		/>
	);
}

interface TabValueContextState {
	tabValue: string;
	setTabValue: (value: string) => void;
}
const TabValueContext = createContext<TabValueContextState | undefined>(
	undefined,
);

export const useTabValue = () => {
	const context = useContext(TabValueContext);
	if (!context) {
		throw new Error("useTabValue must be used within a TabValueProvider");
	}
	return context;
};

export function NavigationPanel() {
	const [tabValue, setTabValue] = useState("");
	const developerMode = useDeveloperMode();
	return (
		<TabValueContext value={{ tabValue, setTabValue }}>
			<Tabs.Root
				orientation="vertical"
				value={tabValue}
				onValueChange={(value) => setTabValue(value)}
			>
				<Tabs.List className="absolute w-[54px] rounded-full bg-[hsla(233,93%,5%,0.8)] px-[4px] py-[8px] overflow-hidden shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset] top-[0px] left-[20px] mt-[60px] grid justify-center gap-[4px]">
					<TabsTrigger value="overview">
						<LayersIcon className="w-[18px] h-[18px] fill-black-30" />
					</TabsTrigger>
					<TabsTrigger value="github">
						<GithubIcon className="w-[18px] h-[18px] stroke-black-30" />
					</TabsTrigger>
					<TabsTrigger value="structure">
						<ListTreeIcon className="w-[18px] h-[18px] stroke-black-30" />
					</TabsTrigger>

					{developerMode && (
						<TabsTrigger value="developer">
							<HammerIcon className="w-[18px] h-[18px] stroke-black-30" />
						</TabsTrigger>
					)}
				</Tabs.List>
				<TabsContent value="overview">
					<Overview />
				</TabsContent>
				<TabsContent value="github">
					<GitHubIntegration />
				</TabsContent>
				<TabsContent value="structure">
					<Structure />
				</TabsContent>
				<TabsContent value="developer">
					<Developer />
				</TabsContent>
			</Tabs.Root>
		</TabValueContext>
	);
}

function ContentPanel({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col gap-[24px] px-[24px] py-[24px] h-full overflow-y-hidden">
			{children}
		</div>
	);
}
function ContentPanelHeader({
	children,
}: {
	children: ReactNode;
}) {
	const { setTabValue } = useTabValue();
	return (
		<header className="flex justify-between">
			<p
				className="text-[22px] font-rosart text-black--30"
				style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
			>
				{children}
			</p>
			<button type="button" onClick={() => setTabValue("")}>
				<XIcon className="w-[16px] h-[16px] text-black-30" />
			</button>
		</header>
	);
}

export function ContentPanelSectionHeader(props: { title: string }) {
	return (
		<div className="flex items-center">
			<span className="flex-shrink text-black-30 text-[16px] font-rosart font-[500]">
				{props.title}
			</span>
			<div className="ml-[16px] flex-grow border-t border-black-80" />
		</div>
	);
}

export function ContentPanelSection(props: { children: ReactNode }) {
	return <div className="grid gap-[8px]">{props.children}</div>;
}

export function ContentPanelSectionFormField(props: { children: ReactNode }) {
	return <div className="grid gap-[2px]">{props.children}</div>;
}

export function Overview() {
	const [editTitle, setEditTitle] = useState(false);
	const { agentName, updateAgentName } = useAgentName();
	return (
		<ContentPanel>
			<ContentPanelHeader>Overview</ContentPanelHeader>

			{editTitle ? (
				<input
					type="text"
					className="text-[16px] text-black-30 p-[4px] text-left outline-black-70 rounded-[8px]"
					defaultValue={agentName ?? "Untitled Agent"}
					ref={(ref) => {
						if (ref === null) {
							return;
						}
						async function update() {
							if (ref === null) {
								return;
							}
							setEditTitle(false);
							await updateAgentName(ref.value);
						}
						ref.focus();
						ref.select();
						ref.addEventListener("blur", update);
						ref.addEventListener("keydown", (e) => {
							if (e.key === "Enter") {
								update();
							}
						});
						return () => {
							ref.removeEventListener("blur", update);
							ref.removeEventListener("keydown", update);
						};
					}}
				/>
			) : (
				<button
					type="button"
					onClick={() => setEditTitle(true)}
					className="text-[16px] text-black-30 p-[4px] text-left"
				>
					{agentName}
				</button>
			)}
		</ContentPanel>
	);
}

function AssignDataForm({
	nodes,
}: {
	nodes: Node[];
}) {
	return (
		<form>
			<p>Assign Data</p>
			<div className="space-y-[14px]">
				<div>
					<Label>Issue comment data</Label>
					<Select name="assignData">
						<SelectTrigger>
							<SelectValue placeholder="Choose data" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="issueComment.body">Comment Body</SelectItem>
							<SelectItem value="issueComment.issue.title">
								Issue Title
							</SelectItem>
							<SelectItem value="issueComment.issue.body">
								Issue Description
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Assign node</Label>
					<Select name="flow">
						<SelectTrigger>
							<SelectValue placeholder="Choose node" />
						</SelectTrigger>
						<SelectContent>
							{nodes.map((node) => (
								<SelectItem value={node.id} key={node.id}>
									{node.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Assign property</Label>
					<Select name="flow">
						<SelectTrigger>
							<SelectValue placeholder="Choose property" />
						</SelectTrigger>
						<SelectContent>
							{nodes.map((node) => (
								<SelectItem value={node.id} key={node.id}>
									{node.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</form>
	);
}

function GitHubIntegration() {
	const { needsAuthorization } = useGitHubIntegration();

	return (
		<ContentPanel>
			<ContentPanelHeader>GitHub Integration</ContentPanelHeader>
			{needsAuthorization ? GoToAccountSettings() : GitHubIntegrationForm()}
		</ContentPanel>
	);
}
function GoToAccountSettings() {
	return (
		<div className="grid gap-[16px]">
			<div className="text-sm text-gray-600">
				Please connect your GitHub account to get started
			</div>
			<Button asChild>
				<Link href="/settings/account">Connect GitHub</Link>
			</Button>
		</div>
	);
}
const integrationEventList = [
	{
		type: "github.issue_comment.created" satisfies GitHubTriggerEvent,
		label: "Comment on Issue",
	},
] as const;
const nextActionList = [
	{
		type: "github.issue_comment.reply" satisfies GitHubNextAction,
		label: "Comment on trigger issue",
	},
] as const;
const mockEventDataList = [
	{
		type: "github.issue_comment.body",
		label: "Body",
	},
];
function GitHubIntegrationForm() {
	const { integration, repositories } = useGitHubIntegration();
	const { graph } = useGraph();
	const [callSign, setCallSign] = useState(integration?.callSign ?? "");
	return (
		<form className="grid gap-[16px] overflow-y-auto mx-[-20px] px-[20px]">
			<ContentPanelSection>
				<ContentPanelSectionHeader title="Repository" />
				<Select
					name="repository"
					defaultValue={integration?.repositoryFullName}
				>
					<SelectTrigger>
						<SelectValue placeholder="Choose repository" />
					</SelectTrigger>
					<SelectContent>
						{repositories.map((repository) => (
							<SelectItem value={repository.full_name} key={repository.id}>
								{repository.full_name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</ContentPanelSection>

			<ContentPanelSection>
				<ContentPanelSectionHeader title="Trigger" />
				<ContentPanelSectionFormField>
					<Label htmlFor="event">Event</Label>
					<Select name="event" defaultValue={integration?.event}>
						<SelectTrigger>
							<SelectValue placeholder="Choose event" />
						</SelectTrigger>
						<SelectContent>
							{integrationEventList.map((integrationEvent) => (
								<SelectItem
									value={integrationEvent.type}
									key={integrationEvent.type}
								>
									{integrationEvent.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<ContentPanelSectionFormField>
						<Label htmlFor="callSign">Call sign</Label>
						<Input
							type="text"
							name="callSign"
							id="callSign"
							placeholder="Enter call sign"
							className="w-full"
							value={callSign}
							onChange={(e) => setCallSign(e.target.value)}
						/>
						<span className="text-black-70 text-[12px]">
							You can call this agent by commenting{" "}
							<span className="py-[0px] px-[4px] text-black--30 bg-black-70 rounded-[2px]">
								/giselle {callSign === "" ? "[call sign]" : callSign}
							</span>{" "}
							in the issue route06inc/giselle.
						</span>
					</ContentPanelSectionFormField>
				</ContentPanelSectionFormField>
			</ContentPanelSection>

			<ContentPanelSection>
				<ContentPanelSectionHeader title="Action" />
				<ContentPanelSectionFormField>
					<Label>Run flow</Label>
					<Select name="flow">
						<SelectTrigger>
							<SelectValue placeholder="Choose next action" />
						</SelectTrigger>
						<SelectContent>
							{graph.flows.map((flow) => (
								<SelectItem value={flow.id} key={flow.id}>
									{flow.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</ContentPanelSectionFormField>
				<ContentPanelSectionFormField>
					<Label>Assign data</Label>
					<div className="flex justify-end">
						<Popover.Root>
							<Popover.Trigger>+</Popover.Trigger>
							<Popover.Portal>
								<Popover.Content
									side="right"
									sideOffset={40}
									align="end"
									className="w-[300px] rounded-[24px] bg-[hsla(234,91%,5%,0.8)] overflow-hidden shadow-[0px_0px_3px_0px_hsla(0,_0%,_100%,_0.25)_inset] backdrop-blur-[16px] px-[18px] py-[18px] "
									onOpenAutoFocus={(event) => {
										event.preventDefault();
									}}
								>
									<AssignDataForm nodes={graph.nodes} />
								</Popover.Content>
							</Popover.Portal>
						</Popover.Root>
					</div>
					{/* <div className="space-y-[12px]">
						<Block className="flex items-center gap-[12px] font-rosart ">
							<div className="leading-tight flex-1">
								<p className="text-[12px] text-black-50">Issue Comment</p>
								<p>Body</p>
							</div>
							<ArrowRightIcon className="w-[16px] h-[16px] text-black-30" />
							<div className="leading-tight flex-1">
								<p className="text-[12px] text-black-50">Untitled node - 1</p>
								<p>Instruction</p>
							</div>
						</Block>
						<Block className="flex items-center gap-[12px] font-rosart justify-between">
							<div className="leading-tight flex-1">
								<p className="text-[12px] text-black-50">Issue Comment</p>
								<p>Issue Description</p>
							</div>
							<ArrowRightIcon className="w-[16px] h-[16px] text-black-30" />
							<div className="leading-tight flex-1">
								<p className="text-[12px] text-black-50">Untitled node - 5</p>
								<p>Text</p>
							</div>
						</Block>

						<Block className="flex items-center gap-[12px] font-rosart justify-between">
							<div className="leading-tight flex-1">
								<p className="text-[12px] text-black-50">Issue Comment</p>
								<div>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Choose data" />
										</SelectTrigger>
										<SelectContent>
											{graph.flows.map((flow) => (
												<SelectItem value={flow.id} key={flow.id}>
													{flow.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<ArrowRightIcon className="w-[16px] h-[16px] text-black-30" />
							<div className="leading-tight flex-1">
								<p className="text-[12px] text-black-50">Untitled node - 5</p>
								<p>Text</p>
							</div>
						</Block>
					</div> */}
				</ContentPanelSectionFormField>
			</ContentPanelSection>
			<ContentPanelSection>
				<ContentPanelSectionHeader title="Then" />
				<ContentPanelSectionFormField>
					<Select name="nextAction" defaultValue={integration?.nextAction}>
						<SelectTrigger>
							<SelectValue placeholder="Choose next action" />
						</SelectTrigger>
						<SelectContent>
							{nextActionList.map((nextAction) => (
								<SelectItem value={nextAction.type} key={nextAction.type}>
									{nextAction.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</ContentPanelSectionFormField>
			</ContentPanelSection>
		</form>
	);
}

// interface GitHubIntegrationFormProps {
// 	repositories: Array<{
// 		id: number;
// 		full_name: string;
// 	}>;
// }
// function GithubIntegrationForm({ repositories }: GitHubIntegrationFormProps) {
// 	interface Flow {
// 		start: Pick<GiselleNode, "id" | "name">;
// 		end: Pick<GiselleNode, "id" | "name">;
// 	}
// 	const { state } = useGraph();
// 	const flows = useMemo(() => {
// 		const edges = allFlowEdges(state.graph.nodes, state.graph.connectors);
// 		const tmpFlows: Flow[] = [];
// 		for (const edge of edges) {
// 			const start = state.graph.nodes.find((node) => node.id === edge.start);
// 			const end = state.graph.nodes.find((node) => node.id === edge.end);
// 			if (start && end) {
// 				tmpFlows.push({
// 					start: {
// 						id: start.id as GiselleNodeId,
// 						name: start.name,
// 					},
// 					end: {
// 						id: end.id as GiselleNodeId,
// 						name: end.name,
// 					},
// 				});
// 			}
// 		}
// 		return tmpFlows;
// 	}, [state.graph]);

// 	const { setting } = useGitHubIntegration();
// 	const [callSign, setCallSign] = useState(setting?.callSign ?? "");
// 	const [_, action, isPending] = useActionState(
// 		async (prevState: unknown, formData: FormData) => {
// 			const repositoryFullName = formData.get("repository") as string;
// 			const event = formData.get("event") as GitHubTriggerEvent;
// 			const nextAction = formData.get("nextAction") as GitHubNextAction;
// 			const flow = formData.get("flow") as string;
// 			const { start, end } = JSON.parse(flow) as Flow;
// 			await save({
// 				id: setting?.id,
// 				agentId: state.graph.agentId,
// 				repositoryFullName,
// 				event,
// 				callSign,
// 				nextAction,
// 				startNodeId: start.id,
// 				endNodeId: end.id,
// 			});
// 		},
// 		null,
// 	);

// 	return (
// 		<form className="grid gap-[16px]" action={action}>
// 			<ContentPanelSection>
// 				<ContentPanelSectionHeader title="Repository" />
// 				<Select name="repository" defaultValue={setting?.repositoryFullName}>
// 					<SelectTrigger>
// 						<SelectValue placeholder="Choose repository" />
// 					</SelectTrigger>
// 					<SelectContent>
// 						{repositories.map((repository) => (
// 							<SelectItem value={repository.full_name} key={repository.id}>
// 								{repository.full_name}
// 							</SelectItem>
// 						))}
// 					</SelectContent>
// 				</Select>
// 			</ContentPanelSection>
// 			<ContentPanelSection>
// 				<ContentPanelSectionHeader title="Trigger" />
// 				<ContentPanelSectionFormField>
// 					<Label htmlFor="event">Event</Label>
// 					<Select name="event" defaultValue={setting?.event}>
// 						<SelectTrigger>
// 							<SelectValue placeholder="Choose event" />
// 						</SelectTrigger>
// 						<SelectContent>
// 							{mockEvents.map((event) => (
// 								<SelectItem value={event.type} key={event.type}>
// 									{event.label}
// 								</SelectItem>
// 							))}
// 						</SelectContent>
// 					</Select>
// 				</ContentPanelSectionFormField>
// 				<ContentPanelSectionFormField>
// 					<Label htmlFor="callSign">Call sign</Label>
// 					<Input
// 						type="text"
// 						name="callSign"
// 						id="callSign"
// 						placeholder="Enter call sign"
// 						className="w-full"
// 						value={callSign}
// 						onChange={(e) => setCallSign(e.target.value)}
// 					/>
// 					<span className="text-black-70 text-[12px]">
// 						You can call this agent by commenting{" "}
// 						<span className="py-[0px] px-[4px] text-black--30 bg-black-70 rounded-[2px]">
// 							/giselle {callSign === "" ? "[call sign]" : callSign}
// 						</span>{" "}
// 						in the issue route06inc/giselle.
// 					</span>
// 				</ContentPanelSectionFormField>
// 			</ContentPanelSection>
// 			<ContentPanelSection>
// 				<ContentPanelSectionHeader title="Action" />
// 				<ContentPanelSectionFormField>
// 					<Label>Run flow</Label>
// 					<Select
// 						name="flow"
// 						defaultValue={JSON.stringify(
// 							flows.find(
// 								(flow) =>
// 									flow.start.id === setting?.startNodeId &&
// 									flow.end.id === setting?.endNodeId,
// 							),
// 						)}
// 					>
// 						<SelectTrigger>
// 							<SelectValue placeholder="Choose flow" />
// 						</SelectTrigger>
// 						<SelectContent>
// 							{flows.map((flow) => (
// 								<SelectItem
// 									value={JSON.stringify(flow)}
// 									key={`${flow.start.id}-${flow.end.id}`}
// 								>
// 									{flow.start.name} → {flow.end.name}
// 								</SelectItem>
// 							))}
// 						</SelectContent>
// 					</Select>
// 				</ContentPanelSectionFormField>
// 				<ContentPanelSectionFormField>
// 					<Label>Then</Label>
// 					<Select name="nextAction" defaultValue={setting?.nextAction}>
// 						<SelectTrigger>
// 							<SelectValue placeholder="Choose next action" />
// 						</SelectTrigger>
// 						<SelectContent>
// 							{mockNextActions.map((nextAction) => (
// 								<SelectItem value={nextAction.type} key={nextAction.type}>
// 									{nextAction.label}
// 								</SelectItem>
// 							))}
// 						</SelectContent>
// 					</Select>
// 				</ContentPanelSectionFormField>
// 			</ContentPanelSection>
// 			<div>
// 				<input type="hidden" name="agentId" value={state.graph.agentId} />
// 				<Button type="submit" disabled={isPending} data-loading={isPending}>
// 					Save
// 				</Button>
// 			</div>
// 		</form>
// 	);
// }

function Developer() {
	const { graphUrl } = useGraph();
	return (
		<ContentPanel>
			<ContentPanelHeader>Developer tools</ContentPanelHeader>
			<div className="flex flex-col gap-[8px]">
				<div>
					<a
						href={getDownloadUrl(graphUrl)}
						className="text-black-30 hover:text-black--30 flex items-center gap-[6px]"
					>
						<DownloadIcon className="w-[16px] h-[16px]" />
						Download the graph
					</a>
				</div>
			</div>
		</ContentPanel>
	);
}

function StructureNodeItem({
	node,
	className,
}: { node: Node; className?: string }) {
	return (
		<div
			className={clsx(
				"hover:bg-white/10 flex items-center gap-[14px] px-[4px] py-[1px] cursor-default",
				className,
			)}
		>
			<ContentTypeIcon
				contentType={node.content.type}
				className="w-[16px] h-[16px] fill-current"
			/>
			<p>{node.name}</p>
		</div>
	);
}

function StructureStepItem({
	step,
	stepClassName,
	variableNodesClassName,
}: {
	step: Step & { node: Node; variableNodes: Node[] };
	stepClassName?: string;
	variableNodesClassName?: string;
}) {
	return (
		<div>
			<StructureNodeItem node={step.node} className={stepClassName} />
			{step.variableNodes.map((node) => (
				<StructureNodeItem
					key={node.id}
					node={node}
					className={variableNodesClassName}
				/>
			))}
		</div>
	);
}
export function Structure() {
	const { graph } = useGraph();
	const flows = useMemo(
		() =>
			graph.flows.map((flow) => ({
				...flow,
				jobs: flow.jobs.map((job) => ({
					...job,
					steps: job.steps
						.map((step) => {
							const node = graph.nodes.find((node) => node.id === step.nodeId);
							const variableNodes = step.variableNodeIds
								.map((nodeId) => graph.nodes.find((node) => node.id === nodeId))
								.filter((node) => node !== undefined);
							if (node === undefined) {
								return null;
							}
							return {
								...step,
								node,
								variableNodes,
							};
						})
						.filter((step) => step !== null),
				})),
			})),
		[graph],
	);
	return (
		<ContentPanel>
			<ContentPanelHeader>Structure</ContentPanelHeader>
			<div className="flex flex-col gap-[8px]">
				{flows.map((flow) => (
					<div key={flow.id}>
						<div className="flex items-center gap-[14px] hover:bg-white/10 px-[4px] py-[1px] rounded-[2px]">
							<WilliIcon className="w-[16px] h-[16px] fill-current" />
							<p className="text-[14px]">{flow.name}</p>
						</div>
						<div className="pt-[4px] flex flex-col gap-[4px] text-[14px]">
							{flow.jobs.map((job) => (
								<div key={job.id}>
									{job.steps.length === 1 ? (
										<StructureStepItem
											step={job.steps[0]}
											stepClassName="pl-[34px]"
											variableNodesClassName="pl-[64px]"
										/>
									) : (
										<div>
											<div className="pl-[34px] hover:bg-white/10 px-[4px] py-[1px] gap-[14px] flex items-center">
												<FrameIcon className="w-[16px] h-[16px] fill-current" />
												<p>Subflow</p>
											</div>

											{job.steps.map((step) => (
												<StructureStepItem
													step={step}
													key={step.id}
													stepClassName="pl-[64px]"
													variableNodesClassName="pl-[94px]"
												/>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</ContentPanel>
	);
}
