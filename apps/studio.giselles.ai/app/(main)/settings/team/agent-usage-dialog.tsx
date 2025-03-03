import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button as ButtonV2 } from "@/components/v2/ui/button";
import { settingsV2Flag } from "@/flags";
import { cn } from "@/lib/utils";
import { type AgentActivity, AgentUsageTable } from "./agent-usage-table";

type AgentUsageDialogProps = {
	activities: AgentActivity[];
};

export async function AgentUsageDialog({ activities }: AgentUsageDialogProps) {
	const settingsV2Mode = await settingsV2Flag();

	return (
		<Dialog>
			<DialogTrigger asChild>
				{settingsV2Mode ? (
					<ButtonV2>View all logs</ButtonV2>
				) : (
					<Button variant="link">View all logs</Button>
				)}
			</DialogTrigger>
			<DialogContent
				className={cn(
					"max-w-7xl",
					settingsV2Mode
						? "border-[0.5px] border-black-400 px-[24px] pt-[16px] pb-[24px] bg-black-850"
						: "",
				)}
			>
				<DialogHeader>
					<DialogTitle
						className={
							settingsV2Mode
								? "text-white-400 text-[16px] leading-[27.2px] tracking-normal font-hubotSans"
								: ""
						}
					>
						Agent Usage Logs
					</DialogTitle>
				</DialogHeader>
				<AgentUsageTable
					activities={activities}
					containerClassName="max-h-[60vh] overflow-y-auto"
				/>
			</DialogContent>
		</Dialog>
	);
}
