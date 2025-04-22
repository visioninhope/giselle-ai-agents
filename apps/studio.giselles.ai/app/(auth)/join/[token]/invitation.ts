import {
	type TeamRole,
	db,
	db as dbInstance,
	invitations,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { getUser } from "@/lib/supabase/get-user";
import type { TeamId } from "@/services/teams";
import type { User } from "@supabase/supabase-js";
import { and, eq, isNull } from "drizzle-orm";

export type ErrorCode = "expired" | "wrong_email" | "already_member";

class JoinError extends Error {
	code: ErrorCode;
	constructor(code: ErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
	}
}

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

export async function acceptInvitation(token: string) {
	if (token.trim() === "") {
		throw new JoinError("expired");
	}

	let user: User;
	try {
		user = await getUser();
	} catch {
		throw new JoinError("wrong_email");
	}

	await db.transaction(async (tx) => {
		const invitation = await fetchInvitationToken(token, tx, true);
		if (!invitation) {
			throw new JoinError("expired");
		}
		if (user.email !== invitation.invitedEmail) {
			throw new JoinError("wrong_email");
		}

		const userDb = await tx
			.select({ dbId: users.dbId })
			.from(users)
			.innerJoin(
				supabaseUserMappings,
				eq(users.dbId, supabaseUserMappings.userDbId),
			)
			.where(eq(supabaseUserMappings.supabaseUserId, user.id));
		const userDbId = userDb[0]?.dbId;
		if (!userDbId) {
			throw new JoinError("wrong_email");
		}

		const membership = await tx
			.select()
			.from(teamMemberships)
			.where(
				and(
					eq(teamMemberships.userDbId, userDbId),
					eq(teamMemberships.teamDbId, invitation.teamDbId),
				),
			)
			.limit(1);
		if (membership.length > 0) {
			throw new JoinError("already_member");
		}

		await tx.insert(teamMemberships).values({
			userDbId,
			teamDbId: invitation.teamDbId,
			role: invitation.role,
		});
		await tx
			.update(invitations)
			.set({ revokedAt: new Date() })
			.where(eq(invitations.token, token));
	});
}
