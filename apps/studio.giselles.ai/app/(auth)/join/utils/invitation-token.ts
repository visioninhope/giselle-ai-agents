import {
	type TeamRole,
	type db,
	db as dbInstance,
	invitations,
	teams,
} from "@/drizzle";
import type { TeamId } from "@/services/teams";
import { and, eq, isNull } from "drizzle-orm";

export type InvitationToken = {
	token: string;
	teamId: TeamId;
	teamDbId: number;
	teamName: string;
	invitedEmail: string;
	expiredAt: Date;
	role: TeamRole;
};

export async function fetchInvitationToken(
	token: string,
	tx: typeof db = dbInstance,
	withLock = false,
): Promise<InvitationToken | null> {
	const baseQuery = tx
		.select({
			token: invitations.token,
			teamDbId: invitations.teamDbId,
			invitedEmail: invitations.email,
			expiredAt: invitations.expiredAt,
			revokedAt: invitations.revokedAt,
			role: invitations.role,
			teamName: teams.name,
			teamId: teams.id,
		})
		.from(invitations)
		.innerJoin(teams, eq(invitations.teamDbId, teams.dbId))
		.where(and(eq(invitations.token, token), isNull(invitations.revokedAt)))
		.limit(1);

	const query = withLock ? baseQuery.for("update") : baseQuery;

	const result = await query;
	const row = result[0];
	if (!row) {
		return null;
	}

	return {
		token: row.token,
		teamId: row.teamId as TeamId,
		teamDbId: row.teamDbId,
		teamName: row.teamName,
		invitedEmail: row.invitedEmail,
		expiredAt: row.expiredAt,
		role: row.role,
	};
}
