import { Card } from "@/app/(main)/settings/components/card";
import { settingsV2Flag } from "@/flags";
import { getAgentActivities } from "./actions";
import { AgentUsageDialog } from "./agent-usage-dialog";
import { AgentUsageTable } from "./agent-usage-table";

export async function AgentUsage() {
	const result = await getAgentActivities({ limit: 50 });
	const settingsV2Mode = await settingsV2Flag();

	if (!result.success || !result.data) {
		return (
			<Card title="Recent Agent Usage">
				<div className="text-zinc-400 p-4">Failed to load agent activities</div>
			</Card>
		);
	}

	const activities = result.data;
	const recentActivities = activities.slice(0, 3);

	if (settingsV2Mode) {
		return (
			<Card
				title="Recent Agent"
				description="This is your URL namespace within Giselle. Please use 48 characters at maximum."
				action={{
					component:
						activities.length > 0 ? (
							<AgentUsageDialog
								activities={activities}
								settingsV2Mode={settingsV2Mode}
							/>
						) : null,
				}}
				settingsV2Mode={settingsV2Mode}
			>
				<AgentUsageTable
					activities={recentActivities}
					settingsV2Mode={settingsV2Mode}
				/>
			</Card>
		);
	}

	return (
		<Card
			title="Recent Agent Usage"
			action={{
				component:
					activities.length > 0 ? (
						<AgentUsageDialog activities={activities} />
					) : null,
			}}
		>
			<AgentUsageTable activities={recentActivities} />
		</Card>
	);
}
