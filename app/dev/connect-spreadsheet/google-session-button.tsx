import type { Session } from "next-auth";
import { signIn, signOut } from "./_utils/auth";

export function GoogleSessionButton({ session }: { session: Session | null }) {
	return session ? (
		<form
			action={async () => {
				"use server";
				await signOut();
			}}
		>
			<button type="submit">Sign out</button>
		</form>
	) : (
		<form
			action={async () => {
				"use server";
				await signIn("google");
			}}
		>
			<button type="submit">Sign in with Google</button>
		</form>
	);
}
