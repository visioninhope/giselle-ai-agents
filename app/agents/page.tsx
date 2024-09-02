import { SubmitButton } from "@/components/ui/submit-button";
import { agents as agentsTable, db } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AgentList() {
	const agents = await db.select().from(agentsTable);
	return (
		<div className="flex flex-col gap-2">
			{agents.map(({ id, name }) => (
				<a
					key={id}
					className="flex border border-border p-4"
					href={`/agents/${id}`}
				>
					{name ?? id}
				</a>
			))}
		</div>
	);
}
export default function AgentListPage() {
	const createAgent = async () => {
		"use server";
		const id = `agnt_${createId()}` as const;
		await db.insert(agentsTable).values({
			id,
		});
		revalidatePath("/agents/page");
		redirect(`/agents/${id}`);
	};
	return (
		<div className="container mt-8">
			<section className="text-foreground">
				<div className="flex flex-col gap-8">
					<div className="flex justify-between">
						<h1>Agents</h1>
						<form action={createAgent}>
							<SubmitButton type="submit" pendingNode={"Creating..."}>
								Create new agent
							</SubmitButton>
						</form>
					</div>
					<Suspense fallback={<span>loading</span>}>
						<AgentList />
					</Suspense>
				</div>
			</section>
		</div>
	);
}
