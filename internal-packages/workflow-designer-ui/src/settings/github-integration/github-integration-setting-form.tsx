import {
	WorkspaceGitHubIntegrationNextAction,
	WorkspaceGitHubIntegrationPayloadField,
	WorkspaceGitHubIntegrationTrigger,
} from "@giselle-sdk/data-type";
import type { GitHubIntegrationRepository } from "@giselle-sdk/integration";
import { useIntegration } from "@giselle-sdk/integration/react";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useState } from "react";
import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui";
import { PayloadMapForm } from "./payload-map-form";
import { useGitHubIntegrationSetting } from "./use-github-integration-setting";

export function GitHubIntegrationSettingForm() {
	const { github } = useIntegration();

	switch (github.status) {
		case "unset":
			return "unset";
		case "unauthorized":
			return "unauthorized";
		case "not-installed":
			return "not-installed";
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
	const { isLoading, data, handleSubmit } = useGitHubIntegrationSetting();
	const [selectedTrigger, setSelectedTrigger] = useState<
		WorkspaceGitHubIntegrationTrigger | undefined
	>(data?.event);

	if (isLoading) {
		return null;
	}

	const getAvailablePayloadFields = (
		trigger: WorkspaceGitHubIntegrationTrigger,
	) => {
		const fields = Object.values(WorkspaceGitHubIntegrationPayloadField.Enum);
		const triggerParts = trigger.split(".");
		const triggerPrefix = `${triggerParts[0]}.${triggerParts[1]}`;
		return fields.filter((field) => field.startsWith(triggerPrefix));
	};

	const getAvailableNextActions = (
		trigger: WorkspaceGitHubIntegrationTrigger,
	) => {
		const actions = Object.values(WorkspaceGitHubIntegrationNextAction.Enum);
		const triggerParts = trigger.split(".");
		const triggerPrefix = `${triggerParts[0]}.${triggerParts[1]}`;
		return actions.filter((action) => action.startsWith(triggerPrefix));
	};

	return (
		<div className="flex flex-col gap-[16px]">
			<h2 className="text-[14px] font-accent font-[700] text-white-400">
				GitHub Integration
			</h2>
			<form className="w-full flex flex-col gap-[16px]" onSubmit={handleSubmit}>
				<div className="grid grid-cols-[140px_1fr] gap-x-[4px] gap-y-[16px]">
					<h3 className="relative font-accent text-white-400 text-[14px] flex items-center font-bold">
						Repository
					</h3>
					<div>
						<fieldset className="flex flex-col gap-[4px]">
							<Select value={data?.repositoryNodeId} name="repositoryNodeId">
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
						</fieldset>
					</div>
					<h3 className="font-accent text-white-400 text-[14px] font-bold">
						<div className="flex items-center">Trigger</div>
					</h3>
					<div className="flex flex-col gap-[16px]">
						<fieldset className="flex flex-col gap-[4px]">
							<Label>Event</Label>
							<Select
								name="event"
								defaultValue={data?.event}
								onValueChange={(value: string) => {
									const trigger =
										WorkspaceGitHubIntegrationTrigger.parse(value);
									setSelectedTrigger(trigger);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a trigger" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										value={
											WorkspaceGitHubIntegrationTrigger.Enum[
												"github.issue_comment.created"
											]
										}
									>
										issue_comment.created
									</SelectItem>
									<SelectItem
										value={
											WorkspaceGitHubIntegrationTrigger.Enum[
												"github.pull_request_comment.created"
											]
										}
									>
										pull_request_comment.created
									</SelectItem>
								</SelectContent>
							</Select>
						</fieldset>
						<fieldset className="flex flex-col gap-[4px]">
							<Label>Callsign</Label>
							<input
								type="text"
								className="bg-black-750 h-[28px] border-[1px] border-white-950/10 flex items-center px-[12px] text-[12px] rounded-[8px] outline-none placeholder:text-white-400/70"
								placeholder="Enter call sign"
								name="callsign"
								defaultValue={data?.callsign}
							/>
						</fieldset>
					</div>
					<h3 className="font-accent text-white-400 text-[14px] font-bold">
						Data mapping
					</h3>
					<div>
						<PayloadMapForm
							nodes={workspace.nodes}
							currentPayloadMaps={data?.payloadMaps}
							availablePayloadFields={
								selectedTrigger
									? getAvailablePayloadFields(selectedTrigger)
									: []
							}
						/>
					</div>
					<h3 className="font-accent text-white-400 text-[14px] font-bold">
						Then
					</h3>
					<fieldset className="flex flex-col gap-[4px]">
						<Select name="nextAction" defaultValue={data?.nextAction}>
							<SelectTrigger>
								<SelectValue placeholder="Select an action" />
							</SelectTrigger>
							<SelectContent>
								{selectedTrigger != null &&
									getAvailableNextActions(selectedTrigger).map((action) => (
										<SelectItem key={action} value={action}>
											{action.split(".").slice(1).join(".")}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</fieldset>
				</div>
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
