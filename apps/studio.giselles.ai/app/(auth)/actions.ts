"use server";

import { getAuthCallbackUrl } from "@/app/(auth)/lib";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase";
import type { OAuthProvider } from "@/services/accounts";
import { redirect } from "next/navigation";

async function authorizeOAuth(provider: OAuthProvider, formData?: FormData) {
	const returnUrl = formData?.get("returnUrl") as string | undefined;
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: getAuthCallbackUrl({ provider, next: returnUrl || "/" }),
		},
	});
	logger.debug(`authorized with ${provider}`);

	if (error != null) {
		const { code, message, name, status } = error;
		throw new Error(`${name} occurred: ${code} (${status}): ${message}`);
	}
	logger.debug({ data: data }, `OAuth data got from ${provider}`);

	if (data.url) {
		redirect(data.url);
	}
}

export async function authorizeGitHub(formData: FormData) {
	return await authorizeOAuth("github", formData);
}

export async function authorizeGoogle(formData: FormData) {
	return await authorizeOAuth("google", formData);
}
