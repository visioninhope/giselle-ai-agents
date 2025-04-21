import { db, invitations, teams } from "@/drizzle";
import type { TeamId } from "@/services/teams";
import { and, eq, isNull } from "drizzle-orm";

export type InvitationToken = {
	token: string;
	teamId: TeamId;
	teamDbId: number;
	teamName: string;
	invitedEmail: string;
	expiredAt: Date;
};

export async function fetchInvitationToken(
	token: string,
): Promise<InvitationToken | null> {
	const result = await db
		.select({
			token: invitations.token,
			teamDbId: invitations.teamDbId,
			invitedEmail: invitations.email,
			expiredAt: invitations.expiredAt,
			revokedAt: invitations.revokedAt,
			teamName: teams.name,
			teamId: teams.id,
		})
		.from(invitations)
		.leftJoin(teams, eq(invitations.teamDbId, teams.dbId))
		.where(and(eq(invitations.token, token), isNull(invitations.revokedAt)))
		.limit(1);

	const row = result[0];
	if (!row) {
		return null;
	}
	if (!row.teamId || !row.teamName) {
		return null;
	}

	return {
		token: row.token,
		teamId: row.teamId as TeamId,
		teamDbId: row.teamDbId,
		teamName: row.teamName,
		invitedEmail: row.invitedEmail,
		expiredAt: row.expiredAt,
	};
}
