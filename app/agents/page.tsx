import { Button } from "@/components/ui/button";
import { createAgent } from "./actions/create-agent";
import { getAgents } from "./queries/get-agents";

export default async function Page() {
	const agents = await getAgents();
	return (
		<section className="mx-auto w-[800px] text-foreground mt-[100px]">
			<div className="flex flex-col gap-8">
				<div className="flex justify-between">
					<h1>Agents</h1>
					<form action={createAgent}>
						<Button type="submit">Create new agent</Button>
					</form>
				</div>
				{agents.map(({ id, urlId }) => (
					<a
						key={id}
						className="border border-border p-4"
						href={`/agents/${urlId}`}
					>
						{urlId}
					</a>
				))}
			</div>
		</section>
	);
}
