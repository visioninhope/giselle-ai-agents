import { agents, db } from "@/drizzle";
import { fetchCurrentTeam } from "@/services/teams";
import { ToastProvider } from "@giselles-ai/contexts/toast";
import { formatTimestamp } from "@giselles-ai/lib/utils";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { DeleteAgentButton, DuplicateAgentButton, Toasts } from "./components";

function DataList({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="text-black-30">
			<p className="text-[12px]">{label}</p>
			<div className="font-bold">{children}</div>
		</div>
	);
}

async function AgentList() {
	const currentTeam = await fetchCurrentTeam();
	const dbAgents = await db
		.select({
			id: agents.id,
			name: agents.name,
			updatedAt: agents.updatedAt,
			workspaceId: agents.workspaceId,
		})
		.from(agents)
		.where(
			and(eq(agents.teamDbId, currentTeam.dbId), isNotNull(agents.workspaceId)),
		)
		.orderBy(desc(agents.updatedAt));
	if (dbAgents.length === 0) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="grid gap-[8px] justify-center text-center">
					<h3 className="text-[18px] font-geist font-bold text-black-400">
							No apps yet.
					</h3>
					<p className="text-[12px] font-geist text-black-400">
							Please create a new app with the 'New App +' button in the left sidebar.
					</p>
				</div>
			</div>
		);
	}
	return (
		<>
			<div className="flex flex-wrap gap-4">
				{dbAgents.map((agent) => (
					<div
						key={agent.id}
						className="relative group flex-grow basis-[280px] min-w-[280px] max-w-[376px] h-[354px]"
					>
						{/* メニューボタン - カードの上に絶対位置で配置 */}
						<div className="absolute top-0 right-[8px] z-10 opacity-60 group-hover:opacity-100 transition-opacity flex">
							<DuplicateAgentButton agentId={agent.id} agentName={agent.name} />
							<DeleteAgentButton agentId={agent.id} agentName={agent.name} />
						</div>

						<Link href={`/workspaces/${agent.workspaceId}`}>
							<div className="bg-white-850/10 p-[16px] relative rounded-[8px] transition-all duration-300 hover:shadow-lg h-full flex flex-col">
								<div className="h-[20px] mb-1.5" />

								<div className="h-[150px] bg-black-80 rounded-[8px] mb-4" />

								<div className="flex-grow">
									<h3 className="font-hubot text-white-400 text-[16px] font-semibold mb-1 line-clamp-2">
										agent.name ?? "Unname App"
									</h3>
								</div>

								<div className="mt-auto">
									<div className="border-t-[0.5px] border-black-400 my-4" />
									<div className="flex justify-between items-center">
										<span className="text-white-400 text-xs font-geist truncate max-w-[200px]">
											Edited by you -{" "}
											{formatTimestamp.toRelativeTime(
												new Date(agent.updatedAt).getTime(),
											)}
										</span>
										<button
											type="button"
											className="text-white-400 hover:text-white flex-shrink-0"
										>
											<svg
												width="20"
												height="20"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth="2"
												aria-hidden="true"
											>
												<title>お気に入り</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
												/>
											</svg>
										</button>
									</div>
								</div>

								<div className="absolute z-0 inset-0 border-[0.5px] rounded-[8px] mask-fill bg-gradient-to-br from-[#7182AA80] to-[#02075066] bg-origin-border bg-clip-boarder border-transparent transition-all duration-300" />
								<div className="absolute z-1 inset-0 border-[0.5px] border-white-900 rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
						</Link>
					</div>
				))}
			</div>
		</>
	);
}

export default function AgentListV2Page() {
	return (
		<ToastProvider>
			<div className="w-full">
				<h1 className="text-[28px] font-hubot font-medium mb-8 text-primary-100 drop-shadow-[0_0_20px_#0087f6]">
					My Apps
				</h1>
				<Suspense fallback={<p className="text-center py-8">Loading...</p>}>
					<AgentList />
				</Suspense>
				<Toasts />
			</div>
		</ToastProvider>
	);
}
