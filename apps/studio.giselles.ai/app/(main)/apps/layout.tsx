import { agents, db } from "@/drizzle";
import { fetchCurrentUser } from "@/services/accounts";
import { fetchCurrentTeam } from "@/services/teams";
import { putGraph } from "@giselles-ai/actions";
import { initGraph } from "@giselles-ai/lib/utils";
import { WilliIcon } from "@giselles-ai/icons/willi";
import { createId } from "@paralleldrive/cuid2";
import { Clock, Star, Share2, Trash } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { giselleEngine } from "../../giselle-engine";
import { CreateAgentButton } from "./components";

export default function Layout({
	children,
}: {
	children: ReactNode;
}) {
	async function createAgent() {
		"use server";
		const graph = initGraph();
		const agentId = `agnt_${createId()}` as const;
		const { url } = await putGraph(graph);
		const user = await fetchCurrentUser();
		const team = await fetchCurrentTeam();
		const workspace = await giselleEngine.createWorkspace();
		await db.insert(agents).values({
			id: agentId,
			teamDbId: team.dbId,
			creatorDbId: user.dbId,
			graphUrl: url,
			workspaceId: workspace.id,
		});
		redirect(`/workspaces/${workspace.id}`);
	}

	return (
		<div className="flex h-full divide-x divide-black-80">
			{/* Left Menu */}
			<div className="w-[240px] h-full bg-black-900 p-[24px] flex flex-col">
				{/* New App + Button */}
				<div className="mb-8">
					<form action={createAgent}>
						<button 
							type="submit"
							className="w-full bg-primary-200 hover:bg-primary-100 text-black-900 font-bold py-2 px-4 rounded-md font-hubot"
						>
							New App +
						</button>
					</form>
				</div>
				
				{/* Menu Items */}
				<div className="flex flex-col space-y-5">
					{/* Non-functional menu items */}
					<div className="flex items-center gap-2 text-white-400 hover:text-white cursor-default">
						<Clock className="w-5 h-5" /> <span className="text-[14px] font-hubot">Recent</span>
					</div>
					
					<div className="flex items-center gap-2 text-white-400 hover:text-white cursor-default">
						<Star className="w-5 h-5" /> <span className="text-[14px] font-hubot">Stars</span>
					</div>
					
					{/* Functional link */}
					<Link 
						href="/apps" 
						className="flex items-center gap-2 text-white-400 hover:text-white"
					>
						<WilliIcon className="w-5 h-5 fill-current" /> <span className="text-[14px] font-hubot font-medium border-b border-white-400 pb-0">My created</span>
					</Link>
					
					{/* Non-functional menu items */}
					<div className="flex items-center gap-2 text-white-400 hover:text-white cursor-default">
						<Share2 className="w-5 h-5" /> <span className="text-[14px] font-hubot">Shared</span>
					</div>
					
					<div className="flex items-center gap-2 text-white-400 hover:text-white cursor-default">
						<Trash className="w-5 h-5" /> <span className="text-[14px] font-hubot">Trash</span>
					</div>
				</div>
			</div>
			
			{/* Main Content */}
			<div className="p-[24px] flex-1 bg-black-900">{children}</div>
		</div>
	);
}
