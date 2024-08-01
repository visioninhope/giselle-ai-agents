import {
	db,
	organizations,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { logger, task } from "@trigger.dev/sdk/v3";

type InitializeAccountPayload = {
	userId: number;
};
export const initializeAccountTask = task({
	id: "initializeAccount",
	run: async ({ userId }: InitializeAccountPayload) => {
		logger.info("Initializing account for user", { userId });
		const [organization] = await db
			.insert(organizations)
			.values({
				name: "default",
			})
			.returning({
				id: organizations.id,
			});
		const [team] = await db
			.insert(teams)
			.values({
				organizationId: organization.id,
				name: "default",
			})
			.returning({
				id: teams.id,
			});

		await db.insert(teamMemberships).values({
			userId,
			teamId: team.id,
			role: "admin",
		});
	},
});
