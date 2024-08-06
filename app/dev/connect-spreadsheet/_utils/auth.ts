import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}

			return token;
		},
		session({ session, token }) {
			if (token.id && typeof token.id === "string") {
				session.user.id = token.id;
			}

			return session;
		},
	},
});
