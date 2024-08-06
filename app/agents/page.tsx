import { getCurrentTeam } from "@/app/(auth)";
import { Button } from "@/components/ui/button";
import { agents as agentsTable, blueprints, db } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page() {
	const team = await getCurrentTeam();
	const agents = await db
		.select()
		.from(agentsTable)
		.where(eq(agentsTable.teamId, team.id));
	const createAgent = async () => {
		"use server";
		const urlId = createId();
		const [agent] = await db
			.insert(agentsTable)
			.values({
				urlId: urlId,
				teamId: team.id,
			})
			.returning({
				insertedId: agentsTable.id,
			});
		await db.insert(blueprints).values({
			agentId: agent.insertedId,
			version: 1,
		});
		redirect(`/agents/${urlId}`);
	};
	return (
		<div className="container mt-8">
			<section className="text-foreground">
				<div className="flex flex-col gap-8">
					<div className="flex justify-between">
						<h1>Agents</h1>
						<form action={createAgent}>
							<Button type="submit">Create new agent</Button>
						</form>
					</div>
					{agents.map(({ id, urlId, name }) => (
						<a
							key={id}
							className="border border-border p-4"
							href={`/agents/${urlId}`}
						>
							{name ?? "Untitled"}
						</a>
					))}
				</div>
			</section>
		</div>
	);
}
