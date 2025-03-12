import {
	GitHubIntegrationNextAction,
	GitHubIntegrationPayload,
	GitHubIntegrationTriggerEvent,
	type Node,
} from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { Dam } from "lucide-react";
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

const repositoriesMock = [
	{
		node_id: "R_kgDOMmKFmQ",
		full_name: "giselles-ai/giselle",
		id: 845317529,
	},
	{
		node_id: "R_kgDONbDmrA",
		full_name: "giselles-ai/docs",
		id: 900785836,
	},
	{
		node_id: "R_kgDONiCMhg",
		full_name: "giselles-ai/erd",
		id: 908102790,
	},
	{
		node_id: "R_kgDONnSetA",
		full_name: "giselles-ai/sdk",
		id: 913612468,
	},
] as const;

export function GitHubIntegrationSettingForm() {
	const { data: workspace } = useWorkflowDesigner();
	const { isLoading, data, handleSubmit } = useGitHubIntegrationSetting();

	if (isLoading) {
		return null;
	}
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
									{repositoriesMock.map((repo) => (
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
							<Select name="event" value={data?.event}>
								<SelectTrigger>
									<SelectValue placeholder="Select a trigger" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										value={
											GitHubIntegrationTriggerEvent.Enum[
												"github.issue_comment.created"
											]
										}
									>
										issue_comment.created
									</SelectItem>
									<SelectItem
										value={
											GitHubIntegrationTriggerEvent.Enum[
												"github.pull_request.issue_comment.created"
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
								<SelectItem
									value={
										GitHubIntegrationNextAction.Enum[
											"github.issue_comment.create"
										]
									}
								>
									Create Issue Comment
								</SelectItem>
								<SelectItem
									value={
										GitHubIntegrationNextAction.Enum[
											"github.pull_request.issue_comment.create"
										]
									}
								>
									Create Pull Request Comment
								</SelectItem>
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
