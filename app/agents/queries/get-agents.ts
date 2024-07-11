import { db } from "@/drizzle/db";

export const getAgents = async () => {
	return db.query.agents.findMany();
};
