import type { TeamId } from "@/services/teams";

export type InvitationToken = {
	token: string;
	teamId: TeamId;
	teamName: string;
	invitedEmail: string;
	expiredAt: Date;
};

export async function fetchInvitationToken(
	token: string,
): Promise<InvitationToken | null> {
	// stub implementation
	switch (token) {
		case "valid-token":
			return {
				token: "valid-token",
				teamId: "tm_valid",
				teamName: "Valid Team",
				invitedEmail: "valid@example.com",
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			};

		case "expired-token":
			return {
				token: "expired-token",
				teamId: "tm_expired",
				teamName: "Expired Team",
				invitedEmail: "expired@example.com",
				expiredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
			};

		case "wrong-email-token":
			return {
				token: "wrong-email-token",
				teamId: "tm_wrong-email",
				teamName: "Wrong Email Team",
				invitedEmail: "wrong-email@example.com",
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			};

		case "already-member-token":
			return {
				token: "already-member-token",
				teamId: "tm_already-member",
				teamName: "Already Member Team",
				invitedEmail: "already-member@example.com",
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
			};

		default:
			return null;
	}
}
