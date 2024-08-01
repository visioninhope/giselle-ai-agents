import { NextResponse } from "next/server";
import { getUserInitializationTask } from "./app/(auth)/lib";
import { supabaseMiddleware } from "./lib/supabase";

export default supabaseMiddleware(async (user, request) => {
	if (
		!user &&
		!request.nextUrl.pathname.startsWith("/login") &&
		!request.nextUrl.pathname.startsWith("/signup") &&
		!request.nextUrl.pathname.startsWith("/verify-email")
	) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}
	if (user != null) {
		const task = await getUserInitializationTask({ supabaseUserId: user.id });
		if (task.status !== "COMPLETED") {
			return NextResponse.redirect("/account-initializing");
		}
	}
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
