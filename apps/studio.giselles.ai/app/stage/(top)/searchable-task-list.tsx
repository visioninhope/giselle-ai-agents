"use client";

import { Select } from "@giselle-internal/ui/select";
import { StatusBadge } from "@giselle-internal/ui/status-badge";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Clock,
	LayoutGrid,
	LayoutList,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "../../(main)/settings/components/card";

type Task = {
	id: string;
	workspaceName: string;
	teamName: string;
	status: "inProgress" | "completed" | "failed" | "cancelled";
	createdAt: number;
	link: string;
};

type SortOption = "name-asc" | "name-desc" | "date-desc" | "date-asc";
type ViewMode = "grid" | "list";

function ListItem({ task }: { task: Task }) {
	return (
		<Link
			href={task.link}
			className="group flex items-center justify-between px-2 py-3 first:border-t-0 border-t-[0.5px] border-white/10"
		>
			<div className="flex items-center gap-3">
				{/* Icon */}
				<div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-primary-100/20">
					<svg
						role="img"
						aria-label="Task icon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 486 640"
						className="h-5 w-5 text-white/40 transition-colors group-hover:text-primary-100"
						fill="currentColor"
					>
						<title>Task Icon</title>
						<path d="M278.186 397.523C241.056 392.676 201.368 394.115 171.855 391.185C142.556 387.776 131.742 363.167 136.856 355.603C158.378 364.712 177.928 368.547 201.794 368.387C241.642 368.227 275.576 356.242 303.544 332.486C331.511 308.729 345.362 280.285 344.936 247.207C342.912 222.545 327.782 184.194 293.742 157.188C290.971 154.791 283.673 150.583 283.673 150.583C258.635 135.615 230.188 128.318 198.438 128.69C170.843 130.129 149.747 135.509 126.574 143.711C73.0358 162.781 54.7103 208.589 55.243 249.018V249.924C63.1273 312.298 93.8652 328.757 125.935 351.342L88.1651 394.913L89.1772 400.613C89.1772 400.613 144.527 399.441 174.412 401.998C257.783 410.84 291.877 467.408 292.516 511.14C293.209 560.784 250.431 625.022 180.645 625.555C81.2397 626.354 78.5229 422.292 78.5229 422.292L0 504.215C2.6636 550.237 46.613 601.958 82.5182 617.938C130.356 636.847 187.251 632.107 211.969 629.603C237.486 627.046 363.368 607.072 379.136 498.143C379.136 467.302 358.041 407.964 278.186 397.523ZM266.093 226.433C279.678 277.302 283.14 315.334 263.749 345.27C250.538 359.598 229.868 364.872 209.199 363.114C206.535 362.901 179.207 358.267 162.746 322.685C179.26 301.272 218.522 250.563 255.599 204.222C260.66 209.814 266.093 226.487 266.093 226.487V226.433ZM136.643 152.607H136.536C149.534 135.935 185.44 129.916 203.392 135.349C221.771 144.404 235.515 161.023 250.645 192.769L196.201 261.909L156.62 312.245C150.333 300.633 144.58 286.997 140.158 271.337C120.927 203.103 123.484 170.877 136.589 152.607H136.643Z" />
						<path d="M370.506 0C370.506 55.3433 310.362 106.638 255.013 106.638C310.362 106.638 370.506 157.933 370.506 213.277C370.506 157.933 430.65 106.638 486 106.638C430.65 106.638 370.506 55.3433 370.506 0Z" />
					</svg>
				</div>

				{/* Content */}
				<div className="flex flex-col gap-y-1">
					<p className="text-[14px] font-sans text-white-900">
						{task.workspaceName || "Untitled"}
					</p>
					<p className="text-[12px] font-geist text-white-400">
						Edited {new Date(task.createdAt).toLocaleDateString()}
					</p>
				</div>
			</div>

			{/* Action buttons - hidden for now to match /apps style */}
			<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				{/* Task actions can be added here later */}
			</div>
		</Link>
	);
}

function GridItem({ task }: { task: Task }) {
	return (
		<Link
			href={task.link}
			className="group block w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)]"
		>
			<div className="relative rounded-[12px] overflow-hidden p-4 w-full bg-white/[0.02] backdrop-blur-[8px] border-[0.5px] border-white/8 hover:border-white/16 transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-[0.02] before:rounded-[inherit] before:pointer-events-none group-hover:before:opacity-[0.04]">
				<div className="flex items-start justify-between mb-3">
					<div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-primary-100/20">
						<div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
							<span className="text-xs text-gray-400">T</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{task.status === "inProgress" && (
							<StatusBadge status="info" variant="dot">
								Running
							</StatusBadge>
						)}
						{task.status === "completed" && (
							<StatusBadge status="success" variant="dot">
								Completed
							</StatusBadge>
						)}
						{task.status === "failed" && (
							<StatusBadge status="error" variant="dot">
								Failed
							</StatusBadge>
						)}
						{task.status === "cancelled" && (
							<StatusBadge status="ignored" variant="dot">
								Cancelled
							</StatusBadge>
						)}
					</div>
				</div>
				<div className="space-y-1">
					<h3 className="text-[14px] font-sans text-white-900 truncate">
						{task.workspaceName || "Untitled"}
					</h3>
					<p className="text-[12px] font-geist text-white-400 truncate">
						{new Date(task.createdAt).toLocaleDateString()} · {task.teamName}
					</p>
				</div>
			</div>
		</Link>
	);
}

interface SearchableTaskListProps {
	tasks: Task[];
}

export function SearchableTaskList({ tasks }: SearchableTaskListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("date-desc");
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	// Filter tasks based on search query
	const filteredTasks = useMemo(() => {
		if (!searchQuery) return tasks;
		const query = searchQuery.toLowerCase();
		return tasks.filter((task) => {
			const workspaceName = task.workspaceName?.toLowerCase() || "";
			const teamName = task.teamName?.toLowerCase() || "";
			return workspaceName.includes(query) || teamName.includes(query);
		});
	}, [tasks, searchQuery]);

	// Sort tasks based on selected option
	const sortedTasks = useMemo(() => {
		return [...filteredTasks].sort((a, b) => {
			switch (sortOption) {
				case "name-asc":
					return (a.workspaceName || "").localeCompare(b.workspaceName || "");
				case "name-desc":
					return (b.workspaceName || "").localeCompare(a.workspaceName || "");
				case "date-desc":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "date-asc":
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				default:
					return 0;
			}
		});
	}, [filteredTasks, sortOption]);

	return (
		<>
			<div className="mb-4 flex flex-col sm:flex-row gap-3 items-center">
				<div className="relative flex-1 w-full">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300 h-4 w-4" />
					<Input
						type="text"
						placeholder="Search Tasks..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-12 pr-4 h-10 w-full bg-black-700/50 border-black-600 text-white placeholder:text-black-400"
					/>
				</div>
				<div className="flex gap-2">
					{/* Sort Dropdown */}
					<Select
						options={[
							{
								value: "date-desc",
								label: "Latest",
								icon: <Clock className="h-4 w-4" />,
							},
							{
								value: "date-asc",
								label: "Oldest",
								icon: <Clock className="h-4 w-4" />,
							},
							{
								value: "name-asc",
								label: "Name (A-Z)",
								icon: <ArrowDownAZ className="h-4 w-4" />,
							},
							{
								value: "name-desc",
								label: "Name (Z-A)",
								icon: <ArrowUpAZ className="h-4 w-4" />,
							},
						]}
						placeholder="Sort"
						value={sortOption}
						onValueChange={(value) => setSortOption(value as SortOption)}
					/>

					{/* View Mode Toggle */}
					<div className="flex rounded-lg border border-black-600 overflow-hidden shrink-0">
						<button
							type="button"
							onClick={() => setViewMode("grid")}
							className={`p-3 flex items-center justify-center transition-colors ${
								viewMode === "grid"
									? "bg-black-600 text-white"
									: "bg-black-700/50 text-black-300 hover:text-white"
							}`}
						>
							<LayoutGrid className="h-4 w-4" />
						</button>
						<div className="w-px bg-black-600" />
						<button
							type="button"
							onClick={() => setViewMode("list")}
							className={`p-3 flex items-center justify-center transition-colors ${
								viewMode === "list"
									? "bg-black-600 text-white"
									: "bg-black-700/50 text-black-300 hover:text-white"
							}`}
						>
							<LayoutList className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{sortedTasks.length === 0 && searchQuery ? (
				<div className="flex justify-center items-center h-full mt-12">
					<div className="grid gap-[8px] justify-center text-center">
						<h3 className="text-[18px] font-geist font-bold text-black-400">
							No tasks found.
						</h3>
						<p className="text-[12px] font-geist text-black-400">
							Try searching with a different keyword.
						</p>
					</div>
				</div>
			) : sortedTasks.length === 0 ? (
				<div className="flex justify-center items-center h-full mt-12">
					<div className="grid gap-[8px] justify-center text-center">
						<h3 className="text-[18px] font-geist font-bold text-black-400">
							No tasks yet.
						</h3>
						<p className="text-[12px] font-geist text-black-400">
							Start a new task to see it here.
						</p>
					</div>
				</div>
			) : viewMode === "grid" ? (
				<div className="flex flex-wrap gap-4">
					{sortedTasks.map((task) => (
						<GridItem key={task.id} task={task} />
					))}
				</div>
			) : (
				<Card className="gap-0 py-2">
					{sortedTasks.map((task) => (
						<ListItem key={task.id} task={task} />
					))}
				</Card>
			)}
		</>
	);
}
