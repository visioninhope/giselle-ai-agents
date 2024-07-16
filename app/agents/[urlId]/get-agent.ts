import { agents as agentsSchema, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export const getAgent = async (urlId: string) => {
	const agent = await db.query.agents.findFirst({
		where: eq(agentsSchema.urlId, urlId),
	});
	invariant(agent != null, `Agent with urlId ${urlId} not found`);
	return agent;
};
