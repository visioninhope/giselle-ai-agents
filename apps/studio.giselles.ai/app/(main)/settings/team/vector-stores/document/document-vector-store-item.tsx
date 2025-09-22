"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/packages/contexts/toast";
import type { DocumentVectorStoreId } from "@/packages/types";
import {
	GlassDialogContent,
	GlassDialogFooter,
	GlassDialogHeader,
} from "../../components/glass-dialog-content";
import type { DocumentVectorStore } from "../data";
import type { ActionResult } from "../types";

type DocumentVectorStoreItemProps = {
	store: DocumentVectorStore;
	deleteAction: (
		documentVectorStoreId: DocumentVectorStoreId,
	) => Promise<ActionResult>;
};

export function DocumentVectorStoreItem({
	store,
	deleteAction,
}: DocumentVectorStoreItemProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const { addToast } = useToast();

	const handleConfirmDelete = () => {
		startTransition(async () => {
			const result = await deleteAction(store.id);
			setIsDeleteDialogOpen(false);
			if (result.success) {
				router.refresh();
			} else {
				addToast({
					title: "Error",
					message: result.error,
					type: "error",
				});
			}
		});
	};

	return (
		<div className="group relative rounded-[12px] overflow-hidden w-full bg-white/[0.02] backdrop-blur-[8px] border-[0.5px] border-white/8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.2)] before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-[0.02] before:rounded-[inherit] before:pointer-events-none hover:border-white/12 transition-colors duration-200">
			<div className="px-[24px] py-[16px]">
				<div className="flex items-start justify-between gap-4 mb-4">
					<div>
						<h5 className="text-white-400 font-medium text-[16px] leading-[22.4px] font-sans">
							{store.name}
						</h5>
						<div className="text-black-300 text-[13px] leading-[18px] font-geist mt-1">
							ID: {store.id}
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="Document vector store actions"
								className="transition-opacity duration-200 p-2 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-md disabled:opacity-50"
								disabled={isPending}
							>
								<MoreVertical className="h-4 w-4" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-[180px] bg-black-850 border-[0.5px] border-black-400 rounded-[8px]"
						>
							<DropdownMenuItem
								onSelect={(event) => {
									event.preventDefault();
									setIsDeleteDialogOpen(true);
								}}
								className="flex items-center px-3 py-2 text-[14px] leading-[16px] text-error-900 hover:bg-error-900/20 rounded-md"
							>
								<Trash className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<GlassDialogContent variant="destructive">
					<GlassDialogHeader
						title="Delete Document Vector Store"
						description={`This action cannot be undone. This will permanently delete the document vector store "${store.name}" and its embedding profiles.`}
						onClose={() => setIsDeleteDialogOpen(false)}
						variant="destructive"
					/>
					<GlassDialogFooter
						onCancel={() => setIsDeleteDialogOpen(false)}
						onConfirm={handleConfirmDelete}
						confirmLabel="Delete"
						isPending={isPending}
						variant="destructive"
					/>
				</GlassDialogContent>
			</Dialog.Root>
		</div>
	);
}
