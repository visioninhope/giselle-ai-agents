"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { MoreVertical, Settings, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/packages/contexts/toast";
import type { DocumentVectorStoreId } from "@/packages/types";
import {
	GlassDialogBody,
	GlassDialogContent,
	GlassDialogFooter,
	GlassDialogHeader,
} from "../../components/glass-dialog-content";
import type { DocumentVectorStoreWithProfiles } from "../data";
import { DOCUMENT_EMBEDDING_PROFILES } from "../document-embedding-profiles";
import type { ActionResult, DocumentVectorStoreUpdateInput } from "../types";

type DocumentVectorStoreItemProps = {
	store: DocumentVectorStoreWithProfiles;
	deleteAction: (
		documentVectorStoreId: DocumentVectorStoreId,
	) => Promise<ActionResult>;
	updateAction: (
		documentVectorStoreId: DocumentVectorStoreId,
		input: DocumentVectorStoreUpdateInput,
	) => Promise<ActionResult>;
};

export function DocumentVectorStoreItem({
	store,
	deleteAction,
	updateAction,
}: DocumentVectorStoreItemProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [isUpdating, setIsUpdating] = useState(false);
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

	const disableMenu = isPending || isUpdating;

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
								disabled={disableMenu}
							>
								<MoreVertical className="h-4 w-4" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-[180px] bg-black-850 border-[0.5px] border-black-400 rounded-[8px]"
						>
							<DropdownMenuItem
								onSelect={() => {
									setIsConfigureDialogOpen(true);
								}}
								className="flex items-center px-3 py-2 text-[14px] leading-[16px] text-white-400 hover:bg-white/5 rounded-md"
							>
								<Settings className="h-4 w-4 mr-2" />
								Configure Sources
							</DropdownMenuItem>
							<DropdownMenuSeparator className="my-1 h-px bg-white/10" />
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

			<DocumentVectorStoreConfigureDialog
				open={isConfigureDialogOpen}
				onOpenChange={setIsConfigureDialogOpen}
				store={store}
				updateAction={updateAction}
				onSuccess={() => {
					router.refresh();
					addToast({
						title: "Vector store updated",
						message: "Configuration saved successfully.",
						type: "success",
					});
				}}
				onPendingChange={setIsUpdating}
				showErrorToast={(message) => {
					addToast({ title: "Error", message, type: "error" });
				}}
			/>
		</div>
	);
}

type DocumentVectorStoreConfigureDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	store: DocumentVectorStoreWithProfiles;
	updateAction: (
		documentVectorStoreId: DocumentVectorStoreId,
		input: DocumentVectorStoreUpdateInput,
	) => Promise<ActionResult>;
	onSuccess: () => void;
	onPendingChange: (pending: boolean) => void;
	showErrorToast: (message: string) => void;
};

function DocumentVectorStoreConfigureDialog({
	open,
	onOpenChange,
	store,
	updateAction,
	onSuccess,
	onPendingChange,
	showErrorToast,
}: DocumentVectorStoreConfigureDialogProps) {
	const availableProfiles = useMemo(
		() => Object.entries(DOCUMENT_EMBEDDING_PROFILES),
		[],
	);
	const defaultProfiles = useMemo(
		() => availableProfiles.map(([id]) => Number(id)),
		[availableProfiles],
	);
	const nameInputId = useId();
	const [name, setName] = useState(store.name);
	const [selectedProfiles, setSelectedProfiles] = useState<number[]>(
		store.embeddingProfileIds.length > 0
			? store.embeddingProfileIds
			: defaultProfiles,
	);
	const [error, setError] = useState<string>("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		onPendingChange(isPending);
	}, [isPending, onPendingChange]);

	useEffect(() => {
		if (!open) {
			return;
		}
		setError("");
		setName(store.name);
		setSelectedProfiles(
			store.embeddingProfileIds.length > 0
				? store.embeddingProfileIds
				: defaultProfiles,
		);
	}, [open, store, defaultProfiles]);

	const toggleProfile = (profileId: number) => {
		setSelectedProfiles((prev) => {
			const isSelected = prev.includes(profileId);
			if (isSelected) {
				if (prev.length === 1) {
					return prev;
				}
				return prev.filter((id) => id !== profileId);
			}
			return [...prev, profileId];
		});
	};

	const handleSave = () => {
		const trimmedName = name.trim();
		if (trimmedName.length === 0) {
			setError("Name is required");
			return;
		}
		if (selectedProfiles.length === 0) {
			setError("Select at least one embedding profile");
			return;
		}

		setError("");
		startTransition(async () => {
			const result = await updateAction(store.id, {
				name: trimmedName,
				embeddingProfileIds: selectedProfiles,
			});
			if (result.success) {
				onOpenChange(false);
				onSuccess();
				return;
			}
			setError(result.error);
			showErrorToast(result.error);
		});
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<GlassDialogContent>
				<GlassDialogHeader
					title="Configure Sources"
					description="Update the name and embedding models for this vector store."
					onClose={() => onOpenChange(false)}
				/>
				<GlassDialogBody>
					<div className="space-y-6">
						<div className="flex flex-col gap-2">
							<label
								htmlFor={nameInputId}
								className="text-sm text-black-300 font-geist"
							>
								Name
							</label>
							<input
								id={nameInputId}
								className="w-full rounded-md bg-black-950/40 border border-white/10 px-3 py-2 text-white-400 focus:outline-none focus:ring-1 focus:ring-white/20"
								placeholder="Vector store name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								disabled={isPending}
							/>
						</div>

						<div className="space-y-3">
							<div className="text-white-400 text-[14px] leading-[16.8px] font-sans">
								Embedding Models
							</div>
							<div className="text-white-400/60 text-[12px]">
								Select at least one embedding model for ingestion.
							</div>
							<div className="space-y-2">
								{availableProfiles.map(([profileIdString, profile]) => {
									const profileId = Number(profileIdString);
									const isSelected = selectedProfiles.includes(profileId);
									const isLastSelected =
										selectedProfiles.length === 1 && isSelected;
									return (
										<label
											key={profileId}
											className="flex items-start gap-3 p-3 rounded-lg bg-black-300/10 hover:bg-black-300/20 transition-colors"
										>
											<input
												type="checkbox"
												checked={isSelected}
												disabled={isPending || isLastSelected}
												onChange={() => toggleProfile(profileId)}
												className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
											/>
											<div className="flex-1">
												<div className="text-white-400 text-[14px] font-medium">
													{profile.name}
												</div>
												<div className="text-white-400/60 text-[12px] mt-1">
													Provider: {profile.provider} • Dimensions{" "}
													{profile.dimensions}
												</div>
											</div>
										</label>
									);
								})}
							</div>
						</div>

						{error ? <p className="text-error-900 text-sm">{error}</p> : null}
					</div>
				</GlassDialogBody>
				<GlassDialogFooter
					onCancel={() => onOpenChange(false)}
					onConfirm={handleSave}
					confirmLabel="Save"
					isPending={isPending}
					confirmButtonType="button"
				/>
			</GlassDialogContent>
		</Dialog.Root>
	);
}
