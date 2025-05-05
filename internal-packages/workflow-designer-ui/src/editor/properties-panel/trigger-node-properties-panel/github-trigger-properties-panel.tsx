import type {
	GitHubFlowTriggerEvent,
	TriggerNode,
} from "@giselle-sdk/data-type";
import { type GitHubTriggerEventId, githubTriggers } from "@giselle-sdk/flow";
import type {
	GitHubIntegrationInstallation,
	GitHubIntegrationRepository,
} from "@giselle-sdk/integration";
import { useIntegration } from "@giselle-sdk/integration/react";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { InfoIcon } from "lucide-react";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import { GitHubIcon, SpinnerIcon } from "../../../icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
import { Tooltip } from "../../../ui/tooltip";

export function GitHubTriggerPropertiesPanel({ node }: { node: TriggerNode }) {
	const { value } = useIntegration();

	if (node.content.state.status === "configured") {
		return "configured view";
	}

	if (value?.github === undefined) {
		return "unset";
	}
	switch (value.github.status) {
		case "unset":
			return "unset";
		case "unauthorized":
			return <Unauthorized authUrl={value.github.authUrl} />;
		case "not-installed":
			return (
				<InstallGitHubApplication
					installationUrl={value.github.installationUrl}
				/>
			);
		case "invalid-credential":
			return "invalid-credential";
		case "installed":
			return (
				<Installed
					repositories={value.github.repositories}
					installations={value.github.installations}
					node={node}
					installationUrl={value.github.installationUrl}
				/>
			);
		default: {
			const _exhaustiveCheck: never = value.github;
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

function Installed({
	installations,
	node,
	installationUrl,
}: {
	installations: GitHubIntegrationInstallation[];
	node: TriggerNode;
	installationUrl: string;
}) {
	const { data: workspace, updateNodeDataContent } = useWorkflowDesigner();
	const client = useGiselleEngine();
	const [installationId, setInstalltionId] = useState<string>(
		`${installations[0].id}`,
	);
	const repositories = useMemo(() => {
		if (installationId === undefined) {
			return undefined;
		}
		const installation = installations.find(
			(installation) => installation.id === Number.parseInt(installationId),
		);
		if (installation === undefined) {
			return undefined;
		}
		return installation.repositories;
	}, [installationId, installations]);
	const [eventId, setEventId] = useState<GitHubTriggerEventId | undefined>();
	const handleSubmit = useCallback(async () => {
		let event: GitHubFlowTriggerEvent | undefined;
		switch (eventId) {
			case "github.issue.created":
				event = {
					id: eventId,
				};
				break;
			case "github.issue_comment.created":
				event = {
					id: "github.issue_comment.created",
					conditions: {
						callsign: "hello",
					},
				};
		}
		if (event === undefined) {
			return;
		}

		const { triggerId } = await client.configureTrigger({
			trigger: {
				nodeId: node.id,
				workspaceId: workspace?.id,
				enable: false,
				configuration: {
					provider: "github",
					repositoryNodeId: "nd-",
					installationId: 1000,
					event,
				},
			},
		});
		updateNodeDataContent(node, {
			state: {
				status: "configured",
				flowTriggerId: triggerId,
			},
		});
	}, [
		eventId,
		workspace?.id,
		client.configureTrigger,
		node,
		updateNodeDataContent,
	]);

	return (
		<div className="flex flex-col gap-[16px] px-[16px]">
			<p className="text-[18px]">Set up trigger for GitHub Repository</p>
			<form className="w-full flex flex-col gap-[16px]" onSubmit={handleSubmit}>
				<fieldset className="flex flex-col gap-[4px]">
					<Select
						name="repositoryNodeId"
						value={installationId}
						onValueChange={(value) => setInstalltionId(value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a repository" />
						</SelectTrigger>
						<SelectContent>
							{installations.map((installation) => (
								<SelectItem key={installation.id} value={`${installation.id}`}>
									{installation.account &&
										"login" in installation.account &&
										installation.account.login}
									{installation.account &&
										"slug" in installation.account &&
										installation.account.slug}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{/* <p className="text-black-300">
					If your repository is not shown, configure repository access for the
					Giselle app on GitHub.
				</p> */}
				</fieldset>
				{installationId && repositories && (
					// <fieldset className="flex flex-col gap-[4px]">
					// 	<p className="text-[16px]">Repository</p>
					// 	<Select name="repositoryNodeId">
					// 		<SelectTrigger>
					// 			<SelectValue placeholder="Select a repository" />
					// 		</SelectTrigger>
					// 		<SelectContent>
					// 			{repositories.map((repo) => (
					// 				<SelectItem key={repo.node_id} value={repo.node_id}>
					// 					{repo.full_name}
					// 				</SelectItem>
					// 			))}
					// 		</SelectContent>
					// 	</Select>
					// 	{/* <p className="text-black-300">
					// 	If your repository is not shown, configure repository access for the
					// 	Giselle app on GitHub.
					// </p> */}
					// </fieldset>
					<div className="flex flex-col gap-[8px]">
						<ul className="flex flex-col border rounded-[8px] divide-y">
							{repositories.map((repo) => (
								<li
									key={repo.node_id}
									className="px-[12px] py-[12px] flex items-center justify-between"
								>
									{repo.name}
									<button
										type="button"
										className="rounded-[4px] px-[12px] h-[30px] bg-white-900 text-black-900 cursor-pointer"
									>
										Set up
									</button>
								</li>
							))}
						</ul>
						<p className="text-black-400">
							If your repository is not shown, configure repository access for
							the <a href={installationUrl}>Giselle app</a> on GitHub.
						</p>
					</div>
				)}
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
