import { XIcon } from "lucide-react";
import { Label } from "../../components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/select";
import { Section, SectionHeader } from "../components/section";

const mockRepositories = [
	{
		id: "r-1",
		name: "rou06inc/giselle",
	},
	{
		id: "r-2",
		name: "toyamarinyon/langfuse-ai-sdk",
	},
	{
		id: "r-3",
		name: "toyamarinyon/coral",
	},
];

const mockEvents = [
	{
		id: "e-1",
		name: "Comment on Issue",
	},
	{
		id: "e-2",
		name: "Issue created",
	},
];
interface GitHubIntegrationProps {
	setTabValue: (value: string) => void;
}
export function GitHubIntegration(props: GitHubIntegrationProps) {
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
			<div className="grid gap-[16px]">
				<Section>
					<SectionHeader title="Repository" />
					<Select>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Choose value" />
						</SelectTrigger>
						<SelectContent>
							{mockRepositories.map((repository) => (
								<SelectItem value={repository.id} key={repository.id}>
									{repository.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Section>
				<Section>
					<SectionHeader title="Trigger" />
					<Label htmlFor="event">Event</Label>
					<Select name="event">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Choose value" />
						</SelectTrigger>
						<SelectContent>
							{mockEvents.map((event) => (
								<SelectItem value={event.id} key={event.id}>
									{event.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Section>
			</div>
		</div>
	);
}
