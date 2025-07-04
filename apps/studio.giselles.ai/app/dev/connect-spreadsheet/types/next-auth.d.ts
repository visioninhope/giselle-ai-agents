// biome-ignore lint/correctness/noUnusedImports: requires for type assertion
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
	interface JWT {
		accessTokenExpires: number;
		message?: string;
	}
}
