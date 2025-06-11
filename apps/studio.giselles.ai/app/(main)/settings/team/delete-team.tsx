"use client";

import { useActionState, useState } from "react";
import { Alert, AlertDescription } from "../components/alert";
import { Button } from "../components/button";
import { deleteTeam } from "./actions";
import * as Dialog from "@radix-ui/react-dialog";

export function DeleteTeam() {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [state, action, pending] = useActionState(deleteTeam, {
		error: "",
	});

	const handleCloseDialog = () => {
		setShowDeleteConfirm(false);
	};

	return (
		<Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
			<div className="flex justify-between items-center w-full border-[0.5px] border-error-900 relative rounded-[12px] overflow-hidden bg-white/[0.02] backdrop-blur-[8px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-[0.02] before:rounded-[inherit] before:pointer-events-none p-6">
				<div className="flex flex-col gap-y-4">
					<h2 className="text-error-900 font-medium text-[16px] leading-[27.2px] tracking-normal font-sans">
						Delete Team
					</h2>
					<p className="text-red-900/50 font-medium text-[12px] leading-[20.4px] tracking-normal font-geist">
						Permanently remove your Team Account and all of its contents from the
						Giselle platform. This action is not reversible, so please continue
						with caution.
					</p>
				</div>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="whitespace-nowrap">
						Delete Team
					</Button>
				</Dialog.Trigger>
			</div>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
				<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
					<Dialog.Content
						className="w-[90vw] max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[12px] p-6 relative shadow-xl focus:outline-none"
						onEscapeKeyDown={handleCloseDialog}
						onPointerDownOutside={handleCloseDialog}
					>
						{/* Glass effect layers */}
						<div
							className="absolute inset-0 rounded-[12px] backdrop-blur-md"
							style={{
								background:
									"linear-gradient(135deg, rgba(241, 91, 108, 0.03) 0%, rgba(241, 91, 108, 0.12) 100%)",
							}}
						/>
						<div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
						<div className="absolute inset-0 rounded-[12px] border border-error-900/80" />

						<div className="relative z-10 space-y-6">
							<div className="w-full">
								<Dialog.Title className="text-error-900 font-bold text-[20px] leading-[28px] font-sans text-center">
									Delete Team
								</Dialog.Title>
							</div>
							<p className="text-error-900 font-medium text-[14px] leading-[24px] text-left">
								This action cannot be undone. This will permanently delete the team
								and remove all members.
							</p>
							{state.error !== "" && (
								<Alert
									variant="destructive"
									className="mt-2 bg-error-900/5 border-error-900/20"
								>
									<AlertDescription className="text-red-900/50 font-medium text-[12px] leading-[20.4px] tracking-normal font-geist">
										{state.error}
									</AlertDescription>
								</Alert>
							)}
							<form action={action} className="flex justify-end space-x-4">
								<Button
									type="button"
									variant="link"
									onClick={handleCloseDialog}
									disabled={pending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="destructive"
									disabled={pending}
								>
									{pending ? "Deleting..." : "Delete Team"}
								</Button>
							</form>
						</div>
					</Dialog.Content>
				</div>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
