"use server";

import { deleteOauthCredential, getAuthCallbackUrl } from "@/app/(auth)/lib";
import { createClient, getUser } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function connectGitHubIdentity() {
	const supabase = await createClient();

	// Manual linking allows the user to link multiple same-provider identities.
	// But it introduces additional complexity, and not suitable for most use cases.
	// We should check if the user already has a GitHub identity here.
	// https://supabase.com/docs/guides/auth/auth-identity-linking#manual-linking-beta
	const supabaseUser = await getUser();
	if (supabaseUser.identities) {
		const githubIdentity = supabaseUser.identities.find(
			(it) => it.provider === "github",
		);
		if (githubIdentity) {
			throw new Error("Already linked to GitHub");
		}
	}

	const { data, error } = await supabase.auth.linkIdentity({
		provider: "github",
		options: {
			redirectTo: getAuthCallbackUrl({ next: "/settings/account" }),
		},
	});

	if (error != null) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}
	if (data.url) {
		redirect(data.url);
	}
}

export async function reconnectGitHubIdentity() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			redirectTo: getAuthCallbackUrl({ next: "/settings/account" }),
		},
	});

	if (error != null) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}
	if (data.url) {
		redirect(data.url);
	}
}

export async function disconnectGitHubIdentity() {
	const supabaseUser = await getUser();
	const supabase = await createClient();
	if (!supabaseUser.identities) {
		throw new Error("No identities");
	}
	if (supabaseUser.identities.length === 1) {
		throw new Error("Cannot unlink last identity");
	}
	const githubIdentity = supabaseUser.identities.find(
		(it) => it.provider === "github",
	);
	if (!githubIdentity) {
		throw new Error("No github identity");
	}
	const { error } = await supabase.auth.unlinkIdentity(githubIdentity);
	if (error) {
		throw new Error("Failed to unlink identity", { cause: error });
	}

	await deleteOauthCredential("github");
}

export async function reconnectGoogleIdentity() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: getAuthCallbackUrl({ next: "/settings/account" }),
		},
	});

	if (error != null) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}
	if (data.url) {
		redirect(data.url);
	}
}

export async function disconnectGoogleIdentity() {
	const supabaseUser = await getUser();
	const supabase = await createClient();
	if (!supabaseUser.identities) {
		throw new Error("No identities");
	}
	if (supabaseUser.identities.length === 1) {
		throw new Error("Cannot unlink last identity");
	}
	const googleIdentity = supabaseUser.identities.find(
		(it) => it.provider === "google",
	);
	if (!googleIdentity) {
		throw new Error("No google identity");
	}
	const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
	if (error) {
		throw new Error("Failed to unlink identity", { cause: error });
	}

	await deleteOauthCredential("google");
}
