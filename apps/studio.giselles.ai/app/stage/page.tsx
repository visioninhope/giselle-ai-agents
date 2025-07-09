import { Button } from "@giselle-internal/ui/button";
import { Select } from "@giselle-internal/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@giselle-internal/ui/table";
import { Mic } from "lucide-react";
import { notFound } from "next/navigation";
import { stageFlag } from "@/flags";
import { fetchUserTeams } from "@/services/teams";

const flowOptions = [
	{ id: "flow", label: "flow" },
	{ id: "alt", label: "alt" },
];

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
	const teams = await fetchUserTeams();
	const teamOptions = teams.map((team) => ({ id: team.id, label: team.name }));
	return (
		<div className="p-[24px] space-y-6">
			<div className="text-center text-[24px] font-sans text-white-100">
				What are we perform next ?
			</div>
			<div className="flex items-center gap-2 justify-center">
				<Select
					id="team"
					placeholder="Select team"
					options={teamOptions}
					renderOption={(o) => o.label}
					widthClassName="w-[150px]"
				/>
				<Select
					id="flow"
					placeholder="Select flow"
					options={flowOptions}
					renderOption={(o) => o.label}
					widthClassName="w-[120px]"
				/>
				<Button variant="glass" size="large" aria-label="voice">
					<Mic className="size-4" />
				</Button>
			</div>
			<div className="max-w-[800px] mx-auto">
				<div className="relative">
					<textarea
						className="w-full h-40 border border-border bg-editor-background rounded-[4px] p-4 text-[14px] text-text resize-none outline-none"
						placeholder="Describe a task"
					/>
					<div className="absolute bottom-2 right-2">
						<Button variant="solid" size="large">
							Start
						</Button>
					</div>
				</div>
			</div>
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
