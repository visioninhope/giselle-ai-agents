// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase";
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
	const { error } = await supabase.auth.exchangeCodeForSession(code);
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
