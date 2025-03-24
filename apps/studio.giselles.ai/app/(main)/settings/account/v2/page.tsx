import { Button } from "@/components/v2/ui/button";
import { ToastProvider } from "@/packages/contexts/toast";
import TeamCreation from "@/services/teams/components/v2/team-creation";
import { fetchUserTeams } from "@/services/teams/fetch-user-teams";
import { Search } from "lucide-react";
import { Card } from "../../components/v2/card";
import { AccountToasts } from "../account-toasts";

export default async function AccountSettingPageV2() {
	const allTeams = await fetchUserTeams();

	return (
		<ToastProvider>
			<div className="flex flex-col gap-[24px]">
				<h3
					className="text-primary-100 font-semibold text-[28px] leading-[28px] tracking-[-0.011em] font-hubot"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Overview
				</h3>
				<div className="flex flex-col gap-y-[16px]">
					<Card
						title="Team"
						description="The teams that are associated with your Giselle’s account."
						action={{
							component: (
								<div className="grid placeitems-center">
									<TeamCreation>
										<Button>Create new team</Button>
									</TeamCreation>
								</div>
							),
						}}
					>
						<div className="flex items-center gap-x-[11px] py-2 px-3 border-[0.5px] border-black-820/50 rounded-[8px] bg-black-350/20">
							<Search className="size-6 text-black-400" />
							<input
								type="text"
								placeholder="Search for a team..."
								className="rounded w-full text-white-900 font-medium text-[14px] leading-[23.8px] font-geist placeholder:text-black-400"
							/>
						</div>
						<div className="border-[0.5px] border-black-400 rounded-[8px] divide-y divide-black-400">
							{allTeams.map((team) => (
								<UserTeam key={team.id} teamName={team.name} />
							))}
						</div>
					</Card>
				</div>
			</div>
			<AccountToasts />
		</ToastProvider>
	);
}

function UserTeam({ teamName }: { teamName: string }) {
	return (
		<div className="flex items-center justify-between gap-4 p-4 bg-black-400/10">
			<div className="flex flex-col">
				<div className="text-white-400 font-medium text-[16px] leading-[22.4px] font-geist">
					{teamName}
				</div>
				<div className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
					Admin
				</div>
			</div>
		</div>
	);
}
