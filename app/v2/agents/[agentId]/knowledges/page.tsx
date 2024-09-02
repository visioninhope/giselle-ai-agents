import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
	agents,
	db,
	knowledgeOpenaiVectorStoreRepresentations,
	knowledges,
} from "@/drizzle";
import { openai } from "@/lib/openai";
import type { AgentId } from "@/services/agents";
import { getKnowledges } from "@/services/agents/knowledges";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { Suspense } from "react";
import invariant from "tiny-invariant";

type KnowledgeListProps = {
	agentId: AgentId;
};

async function KnowledgeList(props: KnowledgeListProps) {
	const knowledges = await getKnowledges(props.agentId);
	return (
		<Accordion type="multiple">
			{knowledges.map((knowledge) => (
				<AccordionItem key={knowledge.id} value={knowledge.id}>
					<AccordionTrigger> {knowledge.name}</AccordionTrigger>
					<AccordionContent>
						<div>Knowledge</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
export default function KnowledgeListPage({
	params,
}: {
	params: {
		agentId: AgentId;
	};
}) {
	const createKnowledge = async (data: FormData) => {
		"use server";

		const name = data.get("name");
		invariant(
			name != null && typeof name === "string" && name.length > 0,
			"Name is required",
		);
		await db.transaction(async (tx) => {
			const [agent] = await tx
				.select({ dbId: agents.dbId })
				.from(agents)
				.where(eq(agents.id, params.agentId));
			const [knowledge] = await tx
				.insert(knowledges)
				.values({
					id: `knwl_${createId()}`,
					agentDbId: agent.dbId,
					name,
				})
				.returning({
					dbId: knowledges.dbId,
				});
			const vectorStore = await openai.beta.vectorStores.create({
				name,
			});
			await tx.insert(knowledgeOpenaiVectorStoreRepresentations).values({
				knowledgeDbId: knowledge.dbId,
				openaiVectorStoreId: vectorStore.id,
				openaiVectorStoreStatus: vectorStore.status,
			});
		});
		revalidatePath("aaa");
	};
	return (
		<div className="flex flex-col gap-4">
			<Suspense fallback={<div>Loading...</div>}>
				<KnowledgeList agentId={params.agentId} />
			</Suspense>
			<form action={createKnowledge}>
				<Input type="name" name="name" />
				<SubmitButton>Add</SubmitButton>
			</form>
		</div>
	);
}
