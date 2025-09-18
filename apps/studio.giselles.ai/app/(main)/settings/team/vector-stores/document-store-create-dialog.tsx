"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import {
	GlassDialogBody,
	GlassDialogContent,
	GlassDialogFooter,
	GlassDialogHeader,
} from "../components/glass-dialog-content";
import { DOCUMENT_EMBEDDING_PROFILES } from "./document-embedding-profiles";
import type { ActionResult } from "./types";

type DocumentVectorStoreCreateDialogProps = {
	createAction: (
		name: string,
		embeddingProfileIds: number[],
	) => Promise<ActionResult>;
};

export function DocumentVectorStoreCreateDialog({
	createAction,
}: DocumentVectorStoreCreateDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const availableProfiles = useMemo(
		() => Object.entries(DOCUMENT_EMBEDDING_PROFILES),
		[],
	);
	const selectedProfiles = useMemo(
		() => availableProfiles.map(([id]) => Number(id)),
		[availableProfiles],
	);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const onSubmit = useCallback(() => {
		setError(null);
		startTransition(async () => {
			const result = await createAction(name.trim(), selectedProfiles);
			if (result.success) {
				setOpen(false);
				setName("");
			} else {
				setError(result.error);
			}
		});
	}, [createAction, name, selectedProfiles]);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<GlassButton className="whitespace-nowrap">
					<span className="grid place-items-center rounded-full size-4 bg-primary-200 opacity-50">
						<Plus className="size-3 text-black-900" />
					</span>
					New Vector Store
				</GlassButton>
			</Dialog.Trigger>

			<GlassDialogContent>
				<GlassDialogHeader
					title="Create Vector Store"
					description="Create a new Vector Store for your documents."
					onClose={() => setOpen(false)}
				/>

				<GlassDialogBody>
					<div className="flex flex-col gap-4">
						<label className="flex flex-col gap-2">
							<span className="text-sm text-black-300 font-geist">Name</span>
							<input
								className="w-full rounded-md bg-black-950/40 border border-white/10 px-3 py-2 text-white-400 focus:outline-none focus:ring-1 focus:ring-white/20"
								placeholder="e.g. Product Docs"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</label>
						{/* Embedding Models (Cohere-only), styled like Register Repository */}
						<div className="mt-4">
							<div className="text-white-400 text-[14px] leading-[16.8px] font-sans mb-2">
								Embedding Models
							</div>
							<div className="text-white-400/60 text-[12px] mb-3">
								Select at least one embedding model for indexing
							</div>
							<div className="space-y-2">
								{availableProfiles.map(([id, p]) => {
									const profileId = Number(id);
									const isSelected = selectedProfiles.includes(profileId);
									return (
										<label
											key={profileId}
											className="flex items-start gap-3 p-3 rounded-lg bg-black-300/10 hover:bg-black-300/20 transition-colors"
										>
											<input
												type="checkbox"
												checked={isSelected}
												disabled
												className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
											/>
											<div className="flex-1">
												<div className="text-white-400 text-[14px] font-medium">
													{p.name}
												</div>
												<div className="text-white-400/60 text-[12px] mt-1">
													Provider: {p.provider} • Dimensions {p.dimensions}
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
					onCancel={() => setOpen(false)}
					onConfirm={onSubmit}
					confirmLabel="Create"
					isPending={isPending}
					confirmButtonType="button"
				/>
			</GlassDialogContent>
		</Dialog.Root>
	);
}
