"use client";

import { GlassButton } from "@/components/ui/glass-button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import {
	GlassDialogBody,
	GlassDialogContent,
	GlassDialogFooter,
	GlassDialogHeader,
} from "../components/glass-dialog-content";

type Installation = {
	id: number;
	name: string;
};

type Repository = {
	id: number;
	owner: string;
	name: string;
};

export type InstallationWithRepos = {
	installation: Installation;
	repositories: Repository[];
};

type RepositoryRegistrationDialogProps = {
	installationsWithRepos: InstallationWithRepos[];
	registerRepositoryIndexAction: (
		owner: string,
		repo: string,
		installationId: number,
	) => Promise<{ success: true } | { success: false; error: string }>;
};

export function RepositoryRegistrationDialog({
	installationsWithRepos,
	registerRepositoryIndexAction,
}: RepositoryRegistrationDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [ownerId, setOwnerId] = useState<string>("");
	const [repositoryId, setRepositoryId] = useState<string>("");
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	const selectedInstallation = installationsWithRepos.find(
		(i) => String(i.installation.id) === ownerId,
	);
	const repositoryOptions = selectedInstallation?.repositories || [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!ownerId) {
			setError("Owner is required");
			return;
		}
		if (!repositoryId) {
			setError("Repository is required");
			return;
		}

		startTransition(async () => {
			const owner = installationsWithRepos.find(
				(i) => String(i.installation.id) === ownerId,
			)?.installation.name;
			if (!owner) {
				setError("Owner not found");
				return;
			}
			const repo = repositoryOptions.find(
				(r) => String(r.id) === repositoryId,
			)?.name;
			if (!repo) {
				setError("Repository not found");
				return;
			}
			const result = await registerRepositoryIndexAction(
				owner,
				repo,
				Number(ownerId),
			);
			if (result.success) {
				setIsOpen(false);
				setOwnerId("");
				setRepositoryId("");
			} else {
				setError(result.error);
			}
		});
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger asChild>
				<GlassButton className="whitespace-nowrap">
					<span className="grid place-items-center rounded-full size-4 bg-primary-200 opacity-50">
						<Plus className="size-3 text-black-900" />
					</span>
					Register Repository
				</GlassButton>
			</Dialog.Trigger>
			<GlassDialogContent
				onEscapeKeyDown={() => setIsOpen(false)}
				onPointerDownOutside={() => setIsOpen(false)}
			>
				<GlassDialogHeader
					title="Register GitHub Repository"
					description="Add a GitHub repository to your Vector Store to use it in GitHub Vector Store Nodes."
					onClose={() => setIsOpen(false)}
				/>
				<GlassDialogBody>
					<form
						id="register-repository-form"
						onSubmit={handleSubmit}
						className="space-y-4"
						noValidate
					>
						<div className="flex flex-col gap-y-2">
							<label
								htmlFor="owner"
								className="text-white-400 text-[14px] leading-[16.8px] font-sans"
							>
								Owner
							</label>
							<Select
								value={ownerId}
								onValueChange={(val) => {
									setOwnerId(val);
									setRepositoryId("");
								}}
								disabled={isPending}
							>
								<SelectTrigger
									id="owner"
									className="py-2 rounded-[8px] w-full bg-white-30/30 text-black-800 font-medium text-[12px] leading-[20.4px] font-geist shadow-none focus:text-white border border-white-400"
								>
									<SelectValue placeholder="Select owner" />
								</SelectTrigger>
								<SelectContent>
									{installationsWithRepos.length === 0 ? (
										<div className="px-3 py-2 text-muted-foreground text-sm">
											No owners available
										</div>
									) : (
										installationsWithRepos.map(({ installation }) => (
											<SelectItem
												key={installation.id}
												value={String(installation.id)}
											>
												{installation.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-y-2">
							<label
								htmlFor="repo"
								className="text-white-400 text-[14px] leading-[16.8px] font-sans"
							>
								Repository Name
							</label>
							<Select
								value={repositoryId}
								onValueChange={setRepositoryId}
								disabled={isPending || !ownerId}
							>
								<SelectTrigger
									id="repo"
									className="py-2 rounded-[8px] w-full bg-white-30/30 text-black-800 font-medium text-[12px] leading-[20.4px] font-geist shadow-none focus:text-white border border-white-400"
								>
									<SelectValue placeholder="Select repository" />
								</SelectTrigger>
								<SelectContent>
									{!ownerId ? (
										<div className="px-3 py-2 text-muted-foreground text-sm">
											Select owner first
										</div>
									) : repositoryOptions.length === 0 ? (
										<div className="px-3 py-2 text-muted-foreground text-sm">
											No repositories available
										</div>
									) : (
										repositoryOptions.map((repo) => (
											<SelectItem key={repo.id} value={String(repo.id)}>
												{repo.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>
						{error && (
							<div className="mt-1 text-sm text-error-500">{error}</div>
						)}
					</form>
				</GlassDialogBody>
				<GlassDialogFooter
					onCancel={() => setIsOpen(false)}
					onConfirm={() => {
						const form = document.getElementById(
							"register-repository-form",
						) as HTMLFormElement | null;
						if (!form) return;
						if (typeof form.requestSubmit === "function") {
							form.requestSubmit();
						} else {
							form.submit();
						}
					}}
					confirmLabel="Register"
					isPending={isPending}
				/>
			</GlassDialogContent>
		</Dialog.Root>
	);
}
