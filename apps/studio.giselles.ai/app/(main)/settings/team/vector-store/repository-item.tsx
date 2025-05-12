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
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";

const mockDeleteRepository = async (repoId: number) => {
	return { success: true };
};

type RepositoryItemProps = {
	repository: {
		id: number;
		owner: string;
		name: string;
		ingest_status: string;
		last_ingested_commit_sha: string | null;
		created_at: string;
		updated_at: string;
	};
};

export function RepositoryItem({ repository }: RepositoryItemProps) {
	const [ingestStatus, setIngestStatus] = useState(repository.ingest_status);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await mockDeleteRepository(repository.id);
			if (result.success) {
				alert("Repository deleted.");
			}
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	return (
		<div className="border border-black-400 rounded-md p-4 bg-black-900/50">
			<div className="flex justify-between items-center">
				<div>
					<h5 className="text-white-400 font-medium text-[16px] leading-[19.2px] font-hubot">
						{repository.owner}/{repository.name}
					</h5>
					<div className="flex items-center gap-2 mt-1">
						<StatusBadge status={ingestStatus} />
						{repository.last_ingested_commit_sha && (
							<span className="text-black-400 text-[12px] leading-[20.4px] font-geist">
								Last Ingested:{" "}
								{repository.last_ingested_commit_sha.substring(0, 7)}
							</span>
						)}
					</div>
				</div>
				<div className="ml-auto flex gap-2 items-center">
					<AlertDialog
						open={showDeleteDialog}
						onOpenChange={setShowDeleteDialog}
					>
						<AlertDialogTrigger asChild>
							<Button
								variant="destructive"
								className="h-8 px-3 text-[12px] flex items-center gap-1 rounded-md transition-colors duration-150"
								disabled={isDeleting}
								onClick={() => setShowDeleteDialog(true)}
							>
								<Trash className="h-4 w-4 mr-1" />
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
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
								<AlertDialogCancel disabled={isDeleting}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
									{isDeleting ? "Deleting..." : "Delete"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	let bgColor = "bg-gray-500";
	let textColor = "text-white";
	let label = "Unknown";

	switch (status) {
		case "idle":
			bgColor = "bg-green-500";
			textColor = "text-white";
			label = "Ready";
			break;
		case "running":
			bgColor = "bg-blue-500";
			textColor = "text-white";
			label = "Ingesting";
			break;
		case "error":
			bgColor = "bg-red-500";
			textColor = "text-white";
			label = "Error";
			break;
	}

	return (
		<span
			className={`${bgColor} ${textColor} text-[10px] leading-[12px] font-semibold px-2 py-0.5 rounded-full`}
		>
			{label}
		</span>
	);
}
