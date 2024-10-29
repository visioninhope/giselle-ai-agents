// The client you created from the Server-Side Auth instructions
import { db, supabaseUserMappings } from "@/drizzle";
import { createClient } from "@/lib/supabase";
import { initializeAccount } from "@/services/accounts";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get("next") ?? "/";

	if (!code) {
		throw new Error("No code provided");
	}
	const supabase = await createClient();
	const { data, error } = await supabase.auth.exchangeCodeForSession(code);

	const user = data.user;
	if (!user) {
		throw new Error("No user found");
	}
	// initialize account if not already
	const dbUser = await db.query.supabaseUserMappings.findFirst({
		where: eq(supabaseUserMappings.supabaseUserId, user.id),
	});
	console.log(dbUser);
	if (!dbUser) {
		initializeAccount(user.id);
	}

	// TODO: store accessToken and refreshToken
	if (data.session) {
		const { provider_token, provider_refresh_token } = data.session;
		console.log({ provider_token, provider_refresh_token });
	}
	if (error) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}

	const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
	const isLocalEnv = process.env.NODE_ENV === "development";
	if (isLocalEnv) {
		// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
		return NextResponse.redirect(`${origin}${next}`);
	}
	if (forwardedHost) {
		return NextResponse.redirect(`https://${forwardedHost}${next}`);
	}
	return NextResponse.redirect(`${origin}${next}`);
}
