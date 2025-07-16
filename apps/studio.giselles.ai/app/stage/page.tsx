import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";
import {
	isTriggerNode,
	type Workspace,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import { defaultName } from "@giselle-sdk/giselle-engine";
import { notFound } from "next/navigation";
import { db } from "@/drizzle";
import { experimental_storageFlag, stageFlag } from "@/flags";
import { fetchUserTeams } from "@/services/teams";
import { giselleEngine } from "../giselle-engine";
import { type FlowTriggerUIItem, Form } from "./form";

const tasks = [
	{
		id: 1,
		title: "Implement Supabase API instead of S3",
		comments: 4,
		diff: "+53 -143",
		time: "9 min ago",
		repo: "giselles-ai/giselle",
	},
	{
		id: 2,
		title: "Implement memory-storage-driver for tests",
		comments: 4,
		diff: "+84 -0",
		time: "Jul 7",
		repo: "giselles-ai/giselle",
	},
	{
		id: 3,
		title: "Refactor hooks in context.tsx",
		comments: 4,
		diff: "+348 -386",
		time: "Jul 7",
		repo: "giselles-ai/giselle",
	},
	{
		id: 4,
		title: "Implement UnstorageAdapter for GiselleStorage",
		comments: 4,
		diff: "+72 -2",
		time: "Jul 6",
		repo: "giselles-ai/giselle",
	},
	{
		id: 5,
		title: "Update isValidConnection logic in V2NodeCanvas",
		comments: 4,
		diff: "+29 -12",
		time: "Jul 4",
		repo: "giselles-ai/giselle",
	},
	{
		id: 6,
		title: "Refactor flow in giselle-engine",
		comments: 4,
		diff: "+238 -184",
		time: "Jul 2",
		repo: "giselles-ai/giselle",
	},
];

export default async function StagePage() {
	const enableStage = await stageFlag();
	if (!enableStage) {
		return notFound();
	}
	const experimental_storage = await experimental_storageFlag();
	const teams = await fetchUserTeams();
	const teamOptions = teams.map((team) => ({ id: team.id, label: team.name }));
	const flowTriggers: Array<FlowTriggerUIItem> = [];
	for (const team of teams) {
		const tmpFlowTriggers = await db.query.flowTriggers.findMany({
			where: (flowTriggers, { eq }) => eq(flowTriggers.teamDbId, team.dbId),
		});
		const workspaceMap: Map<WorkspaceId, Workspace> = new Map();
		for (const tmpFlowTrigger of tmpFlowTriggers) {
			if (!workspaceMap.has(tmpFlowTrigger.sdkWorkspaceId)) {
				const tmpWorkspace = await giselleEngine.getWorkspace(
					tmpFlowTrigger.sdkWorkspaceId,
					experimental_storage,
				);
				workspaceMap.set(tmpFlowTrigger.sdkWorkspaceId, tmpWorkspace);
			}
			const workspace = workspaceMap.get(tmpFlowTrigger.sdkWorkspaceId);
			if (workspace === undefined) {
				continue;
			}
			const node = workspace.nodes.find(
				(node) =>
					isTriggerNode(node) &&
					node.content.state.status === "configured" &&
					node.content.state.flowTriggerId === tmpFlowTrigger.sdkFlowTriggerId,
			);
			if (node === undefined) {
				continue;
			}
			const flowTrigger = await giselleEngine.getTrigger({
				flowTriggerId: tmpFlowTrigger.sdkFlowTriggerId,
			});
			if (flowTrigger === undefined) {
				continue;
			}
			flowTriggers.push({
				id: tmpFlowTrigger.sdkFlowTriggerId,
				teamId: team.id,
				label: node.name ?? defaultName(node),
				sdkData: flowTrigger,
			});
		}
	}
	return (
		<div className="p-[24px] space-y-6">
			<div className="text-center text-[24px] font-sans text-white-100">
				What are we perform next ?
			</div>
			<Form
				teamOptions={teamOptions}
				flowTriggers={flowTriggers}
				performStageAction={async () => {
					"use server";

					await new Promise((resolve) => setTimeout(resolve, 1000));
					console.log("todo");
					await new Promise((resolve) => setTimeout(resolve, 1000));
					console.log("implement next pr");
				}}
			/>
			<div className="max-w-[900px] mx-auto space-y-2">
				<div className="flex items-center justify-between px-1">
					<h2 className="text-[16px] font-sans text-white-100">Tasks</h2>
					<button
						type="button"
						className="text-[14px] text-black-70 hover:text-white-100"
					>
						Archive
					</button>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead className="w-[80px] text-center">💬</TableHead>
							<TableHead className="w-[80px] text-center">Diff</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{tasks.map((task) => (
							<TableRow key={task.id}>
								<TableCell>
									<div className="flex flex-col">
										<span>{task.title}</span>
										<span className="text-[12px] text-black-600">
											{task.time} · {task.repo}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-center">{task.comments}</TableCell>
								<TableCell className="text-center">{task.diff}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
