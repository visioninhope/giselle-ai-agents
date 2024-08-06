import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Google({
			authorization: {
				params: {
					scope:
						"openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly",
					response_type: "code",
				},
			},
		}),
	],
	callbacks: {
		jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
			}

			if (account) {
				token.accessToken = account.access_token;
			}

			return token;
		},
		session({ session, token }) {
			if (token.id && typeof token.id === "string") {
				session.user.id = token.id;
			}

			if (token.accessToken) {
				session.accessToken = token.accessToken;
			}

			return session;
		},
	},
});
