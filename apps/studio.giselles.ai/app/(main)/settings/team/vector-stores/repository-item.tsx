"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type {
	GitHubRepositoryIndexStatus,
	githubRepositoryIndex,
} from "@/drizzle";
import { cn } from "@/lib/utils";
import type { GitHubRepositoryIndexId } from "@/packages/types";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Trash } from "lucide-react";
import { useState, useTransition } from "react";

type RepositoryItemProps = {
	repositoryIndex: typeof githubRepositoryIndex.$inferSelect;
	deleteRepositoryIndexAction: (
		indexId: GitHubRepositoryIndexId,
	) => Promise<void>;
};

export function RepositoryItem({
	repositoryIndex,
	deleteRepositoryIndexAction,
}: RepositoryItemProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			try {
				await deleteRepositoryIndexAction(repositoryIndex.id);
				setShowDeleteDialog(false);
			} catch (error) {
				console.error(error);
			}
		});
	};

	return (
		<div
			className={cn(
				"relative rounded-[12px] overflow-hidden px-[24px] pt-[16px] pb-[24px] w-full gap-[16px] grid bg-white/[0.02] backdrop-blur-[8px] border-[0.5px] border-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-[0.02] before:rounded-[inherit] before:pointer-events-none",
			)}
		>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<SiGithub className="text-white-400 h-[20px] w-[20px]" />
					<div className="flex flex-col">
						<div className="text-white-400 font-medium text-[16px] leading-[22.4px] font-geist">
							{repositoryIndex.owner}/{repositoryIndex.repo}
						</div>
						<div className="flex items-center gap-2 mt-1">
							<StatusBadge status={repositoryIndex.status} />
							{repositoryIndex.lastIngestedCommitSha && (
								<span className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
									Last Ingested:{" "}
									{repositoryIndex.lastIngestedCommitSha.substring(0, 7)}
								</span>
							)}
						</div>
					</div>
				</div>
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogTrigger asChild>
						<button
							type="button"
							className="rounded-lg px-4 py-2 text-white/80 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
							style={{
								background: "linear-gradient(180deg, #202530 0%, #12151f 100%)",
								border: "1px solid rgba(0,0,0,0.7)",
								boxShadow:
									"inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(5,10,20,0.4), 0 1px 2px rgba(0,0,0,0.3)",
							}}
							disabled={isPending}
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash className="h-4 w-4 mr-1 inline" />
							{isPending ? "Deleting..." : "Delete"}
						</button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Repository</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. Are you sure you want to delete
								this repository?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								type="button"
								onClick={() => setShowDeleteDialog(false)}
								disabled={isPending}
								className="py-2 px-4 border-[0.5px] border-black-400 rounded-[8px] font-sans"
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								type="submit"
								onClick={handleDelete}
								disabled={isPending}
								className="py-2 px-4 bg-error-900 rounded-[8px] text-white-400 font-sans"
							>
								{isPending ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: GitHubRepositoryIndexStatus }) {
	let bgColor = "bg-gray-500";
	let textColor = "text-white";
	let label = "Unknown";

	switch (status) {
		case "idle":
			bgColor = "bg-gray-500";
			textColor = "text-white";
			label = "Waiting for ingestion";
			break;
		case "running":
			bgColor = "bg-blue-500";
			textColor = "text-white";
			label = "Ingesting";
			break;
		case "completed":
			bgColor = "bg-green-500";
			textColor = "text-white";
			label = "Ready";
			break;
		case "failed":
			bgColor = "bg-red-500";
			textColor = "text-white";
			label = "Error";
			break;
		default: {
			const _exhaustiveCheck: never = status;
			throw new Error(`Unknown status: ${_exhaustiveCheck}`);
		}
	}

	return (
		<span
			className={`${bgColor} ${textColor} text-[10px] leading-[12px] font-semibold px-2 py-0.5 rounded-full`}
		>
			{label}
		</span>
	);
}
