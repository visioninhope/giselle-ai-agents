import { ToastProvider } from "@/packages/contexts/toast";
import { fetchCurrentUser } from "@/services/accounts";
import { fetchUserTeams } from "@/services/teams";
import TeamCreation from "@/services/teams/components/team-creation";
import { isProPlan } from "@/services/teams/utils";
import { Button } from "../components/button";
import { Card } from "../components/card";
import UserTeams from "./user-teams";

export default async function AccountSettingPage() {
	const teams = await fetchUserTeams();

	// Add isPro information to each team
	const teamsWithProInfo = teams.map((team) => ({
		id: team.id,
		name: team.name,
		role: team.role,
		isPro: isProPlan(team),
	}));

	const currentUser = await fetchCurrentUser();

	return (
		<ToastProvider>
			<div className="flex flex-col gap-[12px]">
				<h1
					className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
					style={{
						textShadow: "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
					}}
				>
					Overview
				</h1>
				<div className="flex flex-col gap-y-[12px]">
					<div className="space-y-2 p-6 gap-y-[12px]">
						<div className="flex justify-between items-center">
							<div>
								<h4 className="text-white-400 text-[18px] font-medium font-sans">
									Teams
								</h4>
								<p className="text-black-400 text-[12px] font-geist">
									The teams that are associated with your Giselle account.
								</p>
							</div>
							<div className="grid placeitems-center">
								<TeamCreation>
									<Button
										className="rounded-lg px-4 py-2 text-white/80 transition-all duration-200 active:scale-[0.98]"
										style={{
											background:
												"linear-gradient(180deg, #202530 0%, #12151f 100%)",
											border: "1px solid rgba(0,0,0,0.7)",
											boxShadow:
												"inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 8px rgba(5,10,20,0.4), 0 1px 2px rgba(0,0,0,0.3)",
										}}
									>
										Create New Team
									</Button>
								</TeamCreation>
							</div>
						</div>
						<UserTeams
							teams={teamsWithProInfo}
							currentUser={{ id: currentUser.id }}
						/>
					</div>
				</div>
			</div>
		</ToastProvider>
	);
}
