"use client";

import type {
	GitHubRepositoryIndexStatus,
	githubRepositoryIndex,
} from "@/drizzle";
import { cn } from "@/lib/utils";
import type { GitHubRepositoryIndexId } from "@/packages/types";
import { SiGithub } from "@icons-pack/react-simple-icons";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";
import { useState, useTransition } from "react";
import {
	GlassDialogContent,
	GlassDialogFooter,
	GlassDialogHeader,
} from "../components/glass-dialog-content";

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
				"group relative rounded-[12px] overflow-hidden px-[24px] pt-[16px] pb-[24px] w-full gap-[16px] grid bg-white/[0.02] backdrop-blur-[8px] border-[0.5px] border-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-[0.02] before:rounded-[inherit] before:pointer-events-none hover:border-white/12 transition-colors duration-200",
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
				<Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<Dialog.Trigger asChild>
						<button
							type="button"
							className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-md disabled:opacity-50"
							disabled={isPending}
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash className="h-4 w-4" />
						</button>
					</Dialog.Trigger>
					<GlassDialogContent variant="destructive">
						<GlassDialogHeader
							title="Delete Repository"
							description={`This action cannot be undone. This will permanently delete the repository "${repositoryIndex.owner}/${repositoryIndex.repo}".`}
							onClose={() => setShowDeleteDialog(false)}
							variant="destructive"
						/>
						<GlassDialogFooter
							onCancel={() => setShowDeleteDialog(false)}
							onConfirm={handleDelete}
							confirmLabel="Delete"
							isPending={isPending}
							variant="destructive"
						/>
					</GlassDialogContent>
				</Dialog.Root>
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
