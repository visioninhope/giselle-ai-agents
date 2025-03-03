import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button as ButtonV2 } from "@/components/v2/ui/button";
import { type AgentActivity, AgentUsageTable } from "./agent-usage-table";

type AgentUsageDialogProps = {
	activities: AgentActivity[];
	settingsV2Mode?: boolean;
};

export function AgentUsageDialog({
	activities,
	settingsV2Mode,
}: AgentUsageDialogProps) {
	if (settingsV2Mode) {
		return (
			<Dialog>
				<DialogTrigger asChild>
					<ButtonV2>View all logs</ButtonV2>
				</DialogTrigger>
				<DialogContent className="border-[0.5px] border-black-400 px-[24px] pt-[16px] pb-[24px] bg-black-850 max-w-7xl">
					<DialogHeader>
						<DialogTitle className="text-white-400 text-[16px] leading-[27.2px] tracking-normal font-hubotSans">
							Agent Usage Logs
						</DialogTitle>
					</DialogHeader>
					<AgentUsageTable
						activities={activities}
						settingsV2Mode={settingsV2Mode}
						containerClassName="max-h-[60vh] overflow-y-auto"
					/>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link">View all logs</Button>
			</DialogTrigger>
			<DialogContent className="max-w-7xl">
				<DialogHeader>
					<DialogTitle>Agent Usage Logs</DialogTitle>
				</DialogHeader>
				<AgentUsageTable
					activities={activities}
					containerClassName="max-h-[60vh] overflow-y-auto"
				/>
			</DialogContent>
		</Dialog>
	);
}
