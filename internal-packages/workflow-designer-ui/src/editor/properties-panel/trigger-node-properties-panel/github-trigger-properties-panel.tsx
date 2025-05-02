import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import type { GitHubIntegrationRepository } from "@giselle-sdk/integration";
import { useIntegration } from "@giselle-sdk/integration/react";
import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { GitHubIcon, SpinnerIcon } from "../../../icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
import { Tooltip } from "../../../ui/tooltip";
import type { TriggerNode } from "@giselle-sdk/data-type";

export function GitHubTriggerPropertiesPanel({ node }: { node: TriggerNode }) {
	const { value } = useIntegration();

	if (node.content.state.status === "configured") {
		return "configured view";
	}

	const github = value?.github;
	if (github === undefined) {
		return "unset";
	}
	switch (github.status) {
		case "unset":
			return "unset";
		case "unauthorized":
			return <Unauthorized authUrl={github.authUrl} />;
		case "not-installed":
			return (
				<InstallGitHubApplication installationUrl={github.installationUrl} />
			);
		case "invalid-credential":
			return "invalid-credential";
		case "installed":
			return <Installed repositories={github.repositories} />;
		default: {
			const _exhaustiveCheck: never = github;
			throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
		}
	}
}

function Unauthorized({
	authUrl,
}: {
	authUrl: string;
}) {
	const { refresh } = useIntegration();
	const [isPending, startTransition] = useTransition();
	const popupRef = useRef<Window | null>(null);

	// Handler for installation message from popup window
	const handleInstallationMessage = useCallback(
		(event: MessageEvent) => {
			if (event.data?.type === "github-app-installed") {
				startTransition(() => {
					refresh();
				});
			}
		},
		[refresh],
	);

	// Listen for visibility changes to refresh data when user returns to the page
	useEffect(() => {
		// Add event listener for installation message from popup
		window.addEventListener("message", handleInstallationMessage);

		return () => {
			window.removeEventListener("message", handleInstallationMessage);

			// Close popup if component unmounts
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, [handleInstallationMessage]);

	const handleClick = useCallback(() => {
		const width = 800;
		const height = 800;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		popupRef.current = window.open(
			authUrl,
			"Configure GitHub App",
			`width=${width},height=${height},top=${top},left=${left},popup=1`,
		);

		if (!popupRef.current) {
			console.warn("Failed to open popup window");
			return;
		}
	}, [authUrl]);

	return (
		<div className="bg-white-900/10 h-[300px] rounded-[8px] flex items-center justify-center">
			<div className="flex flex-col gap-[8px]">
				<p>To get started you have to sign into your GitHub account</p>
				<button
					type="button"
					className="group cursor-pointer bg-black-900 rounded-[4px] py-[4px] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-wait"
					onClick={handleClick}
					disabled={isPending}
				>
					<GitHubIcon className="size-[18px]" />
					Continue with GitHub
					<SpinnerIcon className="hidden group-disabled:block animate-follow-through-overlap-spin" />
				</button>
			</div>
		</div>
	);
}

function InstallGitHubApplication({
	installationUrl,
}: {
	installationUrl: string;
}) {
	const [isPending, startTransition] = useTransition();
	const { refresh } = useIntegration();
	const popupRef = useRef<Window | null>(null);
	const handleClick = useCallback(() => {
		const width = 800;
		const height = 800;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		popupRef.current = window.open(
			installationUrl,
			"Configure GitHub App",
			`width=${width},height=${height},top=${top},left=${left},popup=1`,
		);

		if (!popupRef.current) {
			console.warn("Failed to open popup window");
			return;
		}
	}, [installationUrl]);

	// Handler for installation message from popup window
	const handleInstallationMessage = useCallback(
		(event: MessageEvent) => {
			if (event.data?.type === "github-app-installed") {
				startTransition(() => {
					refresh();
				});
			}
		},
		[refresh],
	);

	// Listen for visibility changes to refresh data when user returns to the page
	useEffect(() => {
		// Add event listener for installation message from popup
		window.addEventListener("message", handleInstallationMessage);

		return () => {
			window.removeEventListener("message", handleInstallationMessage);

			// Close popup if component unmounts
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, [handleInstallationMessage]);
	return (
		<div className="bg-white-900/10 h-[300px] rounded-[8px] flex items-center justify-center">
			<div className="flex flex-col gap-[8px]">
				<p>
					Install the GitHub application for the accounts you with to Import
					from to continue
				</p>
				<button
					type="button"
					className="group cursor-pointer bg-black-900 rounded-[4px] py-[4px] flex items-center justify-center gap-[8px] disabled:opacity-50 disabled:cursor-wait"
					onClick={handleClick}
					disabled={isPending}
				>
					<GitHubIcon className="size-[18px]" />
					Install
					<SpinnerIcon className="hidden group-disabled:block animate-follow-through-overlap-spin" />
				</button>
			</div>
		</div>
	);
}

export function GitHubIntegrationSettingForm() {
	const { value } = useIntegration();

	const github = value?.github;
	if (github === undefined) {
		return "unset";
	}

	switch (github.status) {
		case "unset":
			return "unset";
		case "unauthorized":
			return <Unauthorized authUrl={github.authUrl} />;
		case "not-installed":
			return (
				<InstallGitHubApplication installationUrl={github.installationUrl} />
			);
		case "invalid-credential":
			return "invalid-credential";
		case "installed":
			return <Installed repositories={github.repositories} />;
		default: {
			const _exhaustiveCheck: never = github;
			throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
		}
	}
}

function Installed({
	repositories,
}: { repositories: GitHubIntegrationRepository[] }) {
	const { data: workspace } = useWorkflowDesigner();
	const [eventId, setEventId] = useState<GitHubTriggerEventId | undefined>();
	return (
		<div className="flex flex-col gap-[16px] px-[16px]">
			<form className="w-full flex flex-col gap-[16px]">
				<fieldset className="flex flex-col gap-[4px]">
					<p className="text-[16px]">Repository</p>
					<Select name="repositoryNodeId">
						<SelectTrigger>
							<SelectValue placeholder="Select a repository" />
						</SelectTrigger>
						<SelectContent>
							{repositories.map((repo) => (
								<SelectItem key={repo.node_id} value={repo.node_id}>
									{repo.full_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{/* <p className="text-black-300">
						If your repository is not shown, configure repository access for the
						Giselle app on GitHub.
					</p> */}
				</fieldset>
				<fieldset className="flex flex-col gap-[4px]">
					<p className="text-[16px]">Event</p>
					<Select
						name="event"
						value={eventId}
						onValueChange={(value) => setEventId(value as GitHubTriggerEventId)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select an event" />
						</SelectTrigger>
						<SelectContent>
							{githubTriggers.map((githubTrigger) => (
								<SelectItem
									key={githubTrigger.event.id}
									value={githubTrigger.event.id}
								>
									{githubTrigger.event.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</fieldset>
				{eventId === "github.issue_comment.created" && (
					<fieldset className="flex flex-col gap-[4px]">
						<div className="flex items-center gap-[4px]">
							<p className="text-[16px]">Callsign</p>
							<Tooltip
								text={
									<p className="w-[260px]">
										Only comments starting with this callsign will trigger the
										workflow, preventing unnecessary executions from unrelated
										comments.
									</p>
								}
							>
								<button type="button">
									<InfoIcon className="size-[16px]" />
								</button>
							</Tooltip>
						</div>
						<input
							type="text"
							name="callsign"
							className={clsx(
								"group w-full flex justify-between items-center rounded-[8px] py-[8px] px-[16px] outline-none focus:outline-none mb-[4px]",
								"border-[2px] border-white-900",
								"text-[14px]",
							)}
							placeholder="/code-review"
						/>
						<p className="text-[14px] text-black-400">
							A callsign is required for issue comment triggers. Examples:
							/code-review, /check-policy
						</p>
					</fieldset>
				)}
				<div className="flex justify-end">
					<button
						type="submit"
						className="h-[28px] rounded-[8px] bg-white-800 text-[14px] cursor-pointer text-black-800 font-[700] px-[16px] font-accent"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	);
}
