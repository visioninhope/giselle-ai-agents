import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/supabase";
import { createAgent, getAgents } from "@/services/agents";
import { redirect } from "next/navigation";
import { Suspense, useActionState } from "react";

type AgentListProps = {
	userId: string;
};
async function AgentList(props: AgentListProps) {
	const agents = await getAgents({ userId: props.userId });
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
export default async function AgentListPage() {
	const user = await getUser();
	const [_, action, isPending] = useActionState(async () => {
		const agent = await createAgent({
			userId: user.id,
		});
		redirect(`/agents/${agent.id}`);
	}, null);
	return (
		<div className="container mt-8">
			<section className="text-foreground">
				<div className="flex flex-col gap-8">
					<div className="flex justify-between">
						<h1>Agents</h1>
						<form action={action}>
							<Button type="submit" disabled={isPending}>
								Create new agent
							</Button>
						</form>
					</div>
					<Suspense fallback={<span>loading</span>}>
						<AgentList userId={user.id} />
					</Suspense>
				</div>
			</section>
		</div>
	);
}
