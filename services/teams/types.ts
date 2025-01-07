import type { subscriptions, teams } from "@/drizzle";

export type CurrentTeam = {
	dbId: typeof teams.$inferSelect.dbId;
	name: typeof teams.$inferSelect.name;
	type: typeof teams.$inferSelect.type;
	activeSubscriptionId: typeof subscriptions.$inferInsert.id | null;
};

export type TeamId = `tm_${string}`;
