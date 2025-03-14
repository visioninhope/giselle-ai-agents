"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/v2/ui/alert";
import { Button } from "@/components/v2/ui/button";
import { useActionState, useState } from "react";
import { deleteTeam } from "../actions";

export function DeleteTeam() {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [state, action, pending] = useActionState(deleteTeam, {
		error: "",
	});

	const handleOpenChange = (open: boolean) => {
		setShowDeleteConfirm(open);
	};

	return (
		<div className="flex justify-between items-center gap-x-[10px] bg-transparent rounded-[8px] border-[0.5px] border-error-900 px-[24px] pt-[16px] pb-[24px] w-full">
			<div className="flex flex-col gap-y-4">
				<h2 className="text-error-900 font-medium text-[16px] leading-[27.2px] tracking-normal font-hubot">
					Delete Team
				</h2>
				<p className="text-red-900/50 font-medium text-[12px] leading-[20.4px] tracking-normal font-geist">
					Permanently remove your Team Account and all of its contents from the
					Giselle's platform. This action is not reversible, so please continue
					with caution.
				</p>
			</div>
			<Dialog open={showDeleteConfirm} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button variant="destructive" className="whitespace-nowrap">
						Delete Team
					</Button>
				</DialogTrigger>
				<DialogContent className="bg-black-850 border-black-400">
					<DialogHeader>
						<DialogTitle className="text-zinc-200">Delete Team</DialogTitle>
					</DialogHeader>
					<Alert
						variant="destructive"
						className="bg-rose-500/10 border-rose-500/20"
					>
						<AlertDescription>
							This action cannot be undone. This will permanently delete the
							team and remove all members.
						</AlertDescription>
					</Alert>
					{state.error !== "" && (
						<Alert
							variant="destructive"
							className="mt-2 bg-rose-500/10 border-rose-500/20"
						>
							<AlertDescription className="text-rose-400">
								{state.error}
							</AlertDescription>
						</Alert>
					)}
					<form action={action} className="flex justify-end space-x-2">
						<Button
							type="button"
							onClick={() => setShowDeleteConfirm(false)}
							className="w-full bg-transparent border-zinc-800 text-zinc-200 hover:bg-zinc-900"
							disabled={pending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="destructive"
							disabled={pending}
							className="w-full"
						>
							{pending ? "Deleting..." : "Delete Team"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
