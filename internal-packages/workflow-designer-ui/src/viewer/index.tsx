"use client";

import {
	type CompletedRun,
	type Generation,
	type Node,
	type QueuedRun,
	type RunningRun,
	WorkflowId,
} from "@giselle-sdk/data-type";
import {
	useRun,
	useRunController,
	useWorkflowDesigner,
} from "giselle-sdk/react";
import { CircleAlertIcon, CircleSlashIcon, TvIcon } from "lucide-react";
import { Tabs } from "radix-ui";
import { type DetailedHTMLProps, useMemo, useState } from "react";
import { ContentTypeIcon, SpinnerIcon, WilliIcon } from "../icons";
import bg from "../images/bg.png";
import { EmptyState } from "../ui/empty-state";
import { GenerationView } from "../ui/generation-view";
import { Header } from "../ui/header";
import { NodeGlance } from "../ui/node-glance";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface NodeTriggerProps
	extends DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	node: Node;
	generation?: Generation;
}
function NodeTrigger({ node, generation, ...props }: NodeTriggerProps) {
	return (
		<button
			type="button"
			className="flex items-center gap-[8px] rounded-[4px] px-[8px] py-[4px] data-[state=active]:bg-black-80 text-white"
			{...props}
		>
			{generation?.status === "queued" && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)}
			{/* {stepRun.status === "failed" && (
				<CircleAlertIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)} */}
			{/* {stepRun.status === "cancelled" && (
				<CircleSlashIcon className="w-[18px] h-[18px] stroke-black-30 fill-transparent" />
			)} */}
			{generation?.status === "running" && (
				<SpinnerIcon className="w-[18px] h-[18px] stroke-black-30 animate-follow-through-spin fill-transparent" />
			)}
			{generation?.status === "completed" && <p>completed</p>}

			<div className="flex flex-col items-start">
				<p className="truncate text-[14px] font-rosart">{node.content.type}</p>
				<p className="line-clamp-1 font-rosart text-black-70 text-[8px]">
					{node.name}
					{/* / {stepRun.status} */}
				</p>
			</div>
		</button>
	);
}

function WorkflowRunViewer({
	run,
	generations,
}: { run: QueuedRun | RunningRun | CompletedRun; generations: Generation[] }) {
	return (
		<Tabs.Root className="flex-1 flex w-full gap-[16px] pt-[16px] overflow-hidden h-full mx-[20px]">
			<div className="w-[200px]">
				<Tabs.List className="flex flex-col gap-[8px]">
					{run.workflow.jobs.map((job, jobRunIndex) => (
						<div key={job.id}>
							<p className="text-[12px] text-black-30 mb-[4px]">
								Job {jobRunIndex + 1}
							</p>
							<div className="flex flex-col gap-[4px]">
								{job.nodes.map((node) => (
									<Tabs.Trigger key={node.id} value={node.id} asChild>
										<NodeTrigger
											node={node}
											generation={
												generations
													.filter(
														(g) =>
															g.status !== "created" &&
															g.context.actionNode.id === node.id,
													)
													.sort((a, b) => a.createdAt - b.createdAt)?.[0]
											}
											key={node.id}
										/>
									</Tabs.Trigger>
								))}
							</div>
						</div>
					))}
				</Tabs.List>
			</div>
			<div className="overflow-y-auto flex-1 pb-[20px]">
				{run.workflow.jobs.flatMap((job) =>
					job.nodes.map((node) => (
						<Tabs.Content key={node.id} value={node.id}>
							{generations
								.filter(
									(g) =>
										g.status !== "created" &&
										g.context.actionNode.id === node.id,
								)
								.sort((a, b) => a.createdAt - b.createdAt)
								.map((generation) => (
									<div key={generation.id}>
										<GenerationView generation={generation} />
									</div>
								))}
							{/* generation.status === "created" && <p>Qeued</p> */}
							{/*generation.status === "running" && (*/}
							{/*<div className="flex flex-col gap-[8px]"> */}
							{/*<p>error</p> */}
							{/* <p>{stepExecution.error}</p> */}
							{/* <div>
										<Button
											type="button"
											onClick={() => {
												retryFlowExecution(execution.id);
											}}
										>
											Retry
										</Button>
									</div> */}
							{/* </div> */}
							{/* )} */}
							{/* {(generation.status === "running" ||
								generation.status === "completed") && (
								<Markdown>
									{generation.content.map((c) => c.text).join("")}
								</Markdown>
							)} */}
							{/* {stepExecution.artifact?.type === "generatedArtifact" && (
								<div className="mt-[10px] flex gap-[12px] items-center">
									<div className="text-[14px] font-bold text-black-70 ">
										Generated{" "}
										{formatTimestamp.toRelativeTime(
											stepExecution.artifact.createdAt,
										)}
									</div>
									<div className="text-black-30 flex items-center">
										<ClipboardButton
											text={stepExecution.artifact.object.content}
											sizeClassName="w-[16px] h-[16px]"
										/>
									</div>
									<div className="text-black-30 text-[14px]">
										<button
											type="button"
											onClick={() => {
												retryFlowExecution(execution.id, stepExecution.stepId);
											}}
										>
											Retry
										</button>
									</div>
								</div>
							)} */}
						</Tabs.Content>
					)),
				)}
				{/* {state.flow.jobs.flatMap((job) =>
					job.steps
						.filter(
							(step) =>
								step.status === stepStatuses.streaming ||
								step.status === stepStatuses.completed,
						)
						.map((step) => (
							<Tabs.Content key={step.id} value={step.id}>
								{step.output.object === "artifact.text" ? (
									<ArtifactRender
										title={step.output.title}
										content={step.output.content}
									/>
								) : (
									<div className="px-[16px] py-[16px] font-rosart text-[18px] text-black-30">
										<table className="w-full divide-y divide-black-40 font-avenir border-separate border-spacing-[16px] text-left text-black-70 ">
											<colgroup>
												<col width="0%" />
												<col width="100%" />
												<col width="0%" />
											</colgroup>
											<thead className="font-[500] text-[12px]">
												<tr>
													<th>Status</th>
													<th>Content</th>
													<th>Relevance</th>
												</tr>
											</thead>
											<tbody className="">
												{step.output.scrapingTasks.map((scrapingTask) => (
													<tr key={scrapingTask.id}>
														<td>
															{scrapingTask.state === "completed" ? (
																<CircleCheckIcon className="w-[20px] h-[20px] fill-green" />
															) : scrapingTask.state === "failed" ? (
																<CircleXIcon className="w-[20px] h-[20px] fill-[hsla(11,100%,50%,1)]" />
															) : (
																""
															)}
														</td>
														<td className="text-black-30 max-w-[1px]">
															<p className="font-rosart text-[18px] underline truncate">
																{scrapingTask.title}
															</p>
															<p className="text-[12px] truncate">
																{scrapingTask.url}
															</p>
														</td>
														<td className="text-green font-[900]">
															{Math.min(
																0.99,
																Number.parseFloat(
																	scrapingTask.relevance.toFixed(2),
																),
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</Tabs.Content>
						)),
				)} */}
			</div>
		</Tabs.Root>
	);
}

export function Viewer() {
	const { generations, run } = useRun();
	const [flowId, setFlowId] = useState<WorkflowId | undefined>();
	const { perform } = useRunController();
	const { data } = useWorkflowDesigner();
	const flow = useMemo(() => {
		if (!flowId) return undefined;
		return data.editingWorkflows.find((flow) => flow.id === flowId);
	}, [flowId, data.editingWorkflows]);
	return (
		<div className="w-full flex-1 px-[16px]">
			<div className="rounded-[8px] overflow-hidden h-full">
				<div
					className="bg-black-20 flex flex-col h-full text-white px-[16px] py-[16px] gap-[16px]"
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				>
					<div className="flex justify-between">
						<div className="w-[180px]">
							<Select
								onValueChange={(value) => {
									setFlowId(WorkflowId.parse(value));
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select flow" />
								</SelectTrigger>
								<SelectContent>
									{data.editingWorkflows.map((workflow) => (
										<SelectItem key={workflow.id} value={workflow.id}>
											{workflow.id}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							{flowId && (
								<button
									type="button"
									onClick={() => {
										perform(flowId);
									}}
								>
									Run
								</button>
							)}
						</div>
					</div>
					{flow && (
						<Tabs.Root orientation="horizontal" className="flex">
							<Tabs.List className="w-[180px] flex flex-col gap-[16px]">
								<div className="flex flex-col gap-[24px]">
									{flow.jobs.map((job, index) => (
										<div key={job.id} className="flex flex-col gap-[8px]">
											<p className="text-black-40 text-[12px] font-[700]">
												Step {index + 1}
											</p>
											{job.nodes.map((node) => (
												<Tabs.Trigger
													value={node.id}
													className="[w-180px] flex p-[16px] justify-between items-center border border-black-40/50 rounded-[8px]"
													key={node.id}
												>
													<NodeGlance
														node={node}
														iconClassName="rounded-[8px] bg-true-white text-true-black flex items-center justify-center p-[8px] **:data-content-type-icon:size-[16px]"
														nameClassName="text-white text-[12px] font-[700]"
														descriptionClassName="text-black-40 text-[10px]"
													/>
												</Tabs.Trigger>
											))}
										</div>
									))}
								</div>
							</Tabs.List>
							<div className="overflow-y-auto flex-1 pb-[20px]">
								{(!run || run.status === "created") && (
									<EmptyState
										icon={
											<WilliIcon className="fill-current w-[32px] h-[32px] text-black-30" />
										}
										title="This has not yet been executed"
										description="You have not yet
													executed the node. Let's execute entire thing and create the final
													output."
									/>
								)}
								{run &&
									run.status !== "created" &&
									run?.workflow?.jobs.flatMap((job) =>
										job.nodes.map((node) => (
											<Tabs.Content
												key={node.id}
												value={node.id}
												className="px-[32px] py-[16px] flex flex-col gap-[24px]"
											>
												<NodeGlance
													node={node}
													iconClassName="rounded-[8px] bg-true-white text-true-black flex items-center justify-center p-[8px] **:data-content-type-icon:size-[26px]"
													nameClassName="text-white text-[20px] font-[700]"
													descriptionClassName="text-black-40 text-[12px]"
												/>
												{generations
													.filter(
														(g) =>
															g.status !== "created" &&
															g.context.actionNode.id === node.id,
													)
													.sort((a, b) => a.createdAt - b.createdAt)
													.map((generation) => (
														<div key={generation.id}>
															<GenerationView generation={generation} />
														</div>
													))}
											</Tabs.Content>
										)),
									)}
							</div>
						</Tabs.Root>
					)}
				</div>
			</div>
		</div>
	);
}
