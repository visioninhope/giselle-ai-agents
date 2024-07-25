import { Button } from "@/components/ui/button";
import { agents as agentsTable, blueprints, db } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { redirect } from "next/navigation";

export default async function Page() {
	const agents = await db.query.agents.findMany();
	const createAgent = async () => {
		"use server";
		const urlId = createId();
		const [agent] = await db
			.insert(agentsTable)
			.values({
				urlId: urlId,
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
		<section className="mx-auto w-[800px] text-foreground mt-[100px]">
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
	);
}
