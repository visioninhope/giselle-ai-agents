import NextAuth, { type DefaultSession, type DefaultUser } from "next-auth";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
}
