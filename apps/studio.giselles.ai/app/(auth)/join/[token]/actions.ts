"use server";

import {
	db,
	invitations,
	supabaseUserMappings,
	teamMemberships,
	users,
} from "@/drizzle";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { fetchInvitationToken } from "./invitation-token";

export async function signoutUser(formData: FormData) {
	const token = formData.get("token") as string;
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect(`/join/${encodeURIComponent(token)}/login`);
}

export type ErrorCode = "expired" | "wrong_email" | "already_member";

class JoinError extends Error {
	code: ErrorCode;
	constructor(code: ErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
	}
}

export async function joinTeam(formData: FormData) {
	const rawToken = formData.get("token");
	const token = typeof rawToken === "string" ? rawToken : "";
	try {
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
	} catch (err: unknown) {
		if (err instanceof JoinError) {
			redirect(`/join/${encodeURIComponent(token)}`);
			return;
		}
		console.error(err);
		redirect(`/join/${encodeURIComponent(token)}`);
		return;
	}

	redirect("/join/success");
}
