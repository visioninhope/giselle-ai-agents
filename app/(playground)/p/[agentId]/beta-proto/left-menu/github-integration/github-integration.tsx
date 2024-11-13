import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type {
	GitHubNextAction,
	GitHubTriggerEvent,
} from "../../../../../../../services/external/github/types";
import { Label } from "../../components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/select";
import { allFlowEdges } from "../../flow/utils";
import type { GiselleNode, GiselleNodeId } from "../../giselle-node/types";
import { useGitHubIntegration } from "../../github-integration/context";
import { useGraph } from "../../graph/context";
import {
	Section,
	SectionFormField,
	SectionHeader,
} from "../components/section";

interface GitHubTriggerEventItem {
	label: string;
	type: GitHubTriggerEvent;
}
const mockEvents: GitHubTriggerEventItem[] = [
	{
		type: "github.issue_comment.created",
		label: "Comment on Issue",
	},
];

interface NextActionItem {
	label: string;
	type: GitHubNextAction;
}
const mockNextActions: NextActionItem[] = [
	{
		type: "github.issue_comment.reply",
		label: "Comment on trigger issue",
	},
];
interface GitHubIntegrationProps {
	setTabValue: (value: string) => void;
}
export function GitHubIntegration(props: GitHubIntegrationProps) {
	const { needsAuthorization, repositories } = useGitHubIntegration();

	return (
		<div className="grid gap-[24px] px-[24px] py-[24px]">
			<header className="flex justify-between">
				<p
					className="text-[22px] font-rosart text-black--30"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					GitHub Integration
				</p>
				<button type="button">
					<XIcon
						className="w-[16px] h-[16px]"
						onClick={() => props.setTabValue("")}
					/>
				</button>
			</header>
			{needsAuthorization
				? GoToAccountSettings()
				: GithubIntegrationForm({ repositories })}
		</div>
	);
}

function GoToAccountSettings() {
	return (
		<div className="grid gap-[16px]">
			<div className="text-sm text-gray-600">
				Please connect your GitHub account to get started
			</div>
			<Button asChild>
				<Link href="/settings/account">Connect GitHub</Link>
			</Button>
		</div>
	);
}

interface GitHubIntegrationFormProps {
	repositories: Array<{
		id: number;
		full_name: string;
	}>;
}
function GithubIntegrationForm({ repositories }: GitHubIntegrationFormProps) {
	interface Flow {
		start: GiselleNode;
		end: GiselleNode;
	}
	const { state } = useGraph();
	const flows = useMemo(() => {
		const edges = allFlowEdges(state.graph.nodes, state.graph.connectors);
		const tmpFlows: Flow[] = [];
		for (const edge of edges) {
			const start = state.graph.nodes.find((node) => node.id === edge.start);
			const end = state.graph.nodes.find((node) => node.id === edge.end);
			if (start && end) {
				tmpFlows.push({ start, end });
			}
		}
		return tmpFlows;
	}, [state.graph]);

	return (
		<div className="grid gap-[16px]">
			<Section>
				<SectionHeader title="Repository" />
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Choose repository" />
					</SelectTrigger>
					<SelectContent>
						{repositories.map((repository) => (
							<SelectItem value={repository.id.toString()} key={repository.id}>
								{repository.full_name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Section>
			<Section>
				<SectionHeader title="Trigger" />
				<SectionFormField>
					<Label htmlFor="event">Event</Label>
					<Select name="event">
						<SelectTrigger>
							<SelectValue placeholder="Choose event" />
						</SelectTrigger>
						<SelectContent>
							{mockEvents.map((event) => (
								<SelectItem value={event.type} key={event.type}>
									{event.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</SectionFormField>
				<SectionFormField>
					<Label htmlFor="command">Call sign</Label>
					<Input
						type="text"
						name="command"
						placeholder="Enter call sign"
						className="w-full"
					/>
					<span className="text-black-70 text-[12px]">
						You can call this agent by commenting{" "}
						<span className="py-[0px] px-[4px] text-black--30 bg-black-70 rounded-[2px]">
							/giselle report-agent
						</span>{" "}
						in the issue route06inc/giselle.
					</span>
				</SectionFormField>
			</Section>
			<Section>
				<SectionHeader title="Action" />
				<SectionFormField>
					<Label>Run flow</Label>
					<Select name="start">
						<SelectTrigger>
							<SelectValue placeholder="Choose flow" />
						</SelectTrigger>
						<SelectContent>
							{flows.map((flow) => (
								<SelectItem
									value={JSON.stringify(flow)}
									key={`${flow.start.id}-${flow.end.id}`}
								>
									{flow.start.name} → {flow.end.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</SectionFormField>
				<SectionFormField>
					<Label>Then</Label>
					<Select name="nextAction">
						<SelectTrigger>
							<SelectValue placeholder="Choose next action" />
						</SelectTrigger>
						<SelectContent>
							{mockNextActions.map((nextAction) => (
								<SelectItem value={nextAction.type} key={nextAction.type}>
									{nextAction.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</SectionFormField>
			</Section>
		</div>
	);
}
