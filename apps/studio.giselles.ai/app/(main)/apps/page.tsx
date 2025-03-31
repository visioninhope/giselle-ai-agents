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
				<div className="grid gap-[16px] justify-center text-center">
					<div className="p-8 rounded-lg bg-black-90/30 border border-black-80">
						<h3 className="text-xl font-rosart mb-4 text-black-20">アプリがまだありません</h3>
						<p className="text-black-40 mb-6">左サイドバーの「New App +」ボタンで新しいアプリを作成してください</p>
						<div className="w-16 h-16 mx-auto opacity-50">
							<svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
								<path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return (
		<>
			<div className="grid gap-[24px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{dbAgents.map((agent) => (
					<div key={agent.id} className="relative group">
						<Link href={`/workspaces/${agent.workspaceId}`}>
							<div className="bg-white-850/10 p-[24px] relative rounded-[12px] transition-all duration-300 hover:bg-white-850/15 hover:shadow-lg">
								<div className="divide-y divide-black-80">
									<div className="h-[70px]">
										<p className="font-rosart text-black-20 text-[20px] font-semibold">
											{agent.name ?? "無名のアプリ"}
										</p>
									</div>
									<div className="pt-[12px] grid grid-col-3">
										<DataList label="最終更新">
											{formatTimestamp.toRelativeTime(
												new Date(agent.updatedAt).getTime(),
											)}
										</DataList>
									</div>
								</div>
								<div className="absolute z-0 inset-0 border-[0.5px] rounded-[12px] mask-fill bg-gradient-to-br from-[#7182AA80] to-[#02075066] bg-origin-border bg-clip-boarder border-transparent transition-all duration-300" />
							</div>
						</Link>
						<div className="absolute top-4 right-4 space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
							<DuplicateAgentButton agentId={agent.id} agentName={agent.name} />
							<DeleteAgentButton agentId={agent.id} agentName={agent.name} />
						</div>
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
				<h1 className="text-[28px] font-hubot font-medium mb-8 text-primary-100 drop-shadow-[0_0_20px_#0087f6]">My created</h1>
				<Suspense fallback={<p className="text-center py-8">読み込み中...</p>}>
					<AgentList />
				</Suspense>
				<Toasts />
			</div>
		</ToastProvider>
	);
}
