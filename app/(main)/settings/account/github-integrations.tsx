import {
	deleteOauthCredential,
	getAuthCallbackUrl,
	getOauthCredential,
	refreshOauthCredential,
} from "@/app/(auth)/lib";
import { Button } from "@/components/ui/button";
import { createClient, getUser } from "@/lib/supabase";
import { GitHubUserClient } from "@/services/external/github/user-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function Authorize() {
	async function redirectToGitHubAuthorizePage() {
		"use server";

		const supabase = await createClient();
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

	return (
		<div>
			<form action={redirectToGitHubAuthorizePage}>
				<Button type="submit">Connect GitHub</Button>
			</form>
		</div>
	);
}

export default async function GitHubIntegrations() {
	const credential = await getOauthCredential("github");
	if (!credential) {
		return <Authorize />;
	}

	const cli = new GitHubUserClient(credential, refreshOauthCredential);
	const gitHubUser = await cli.getUser();

	async function unlink() {
		"use server";
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
		revalidatePath("/settings/account");
	}

	async function unlinkable() {
		const supabaseUser = await getUser();
		return supabaseUser.identities && supabaseUser.identities.length > 1;
	}

	return (
		<p>
			logged in as {gitHubUser.login}{" "}
			{(await unlinkable()) && (
				<button type="button" onClick={unlink}>
					unlink
				</button>
			)}
		</p>
	);
}
