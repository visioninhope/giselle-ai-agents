"use server";

import { db, knowledges } from "@/drizzle";

type CreateKnowledgeArgs = {
	knowledge: {
		name: string;
	};
	blueprintId: number;
};
export const createKnowledge = async (args: CreateKnowledgeArgs) => {
	const [knowledge] = await db
		.insert(knowledges)
		.values({
			name: args.knowledge.name,
			blueprintId: args.blueprintId,
		})
		.returning({
			id: knowledges.id,
		});
	return {
		blueprintId: args.blueprintId,
		knowledge: {
			id: knowledge.id,
			name: args.knowledge.name,
			files: [],
		},
	};
};
