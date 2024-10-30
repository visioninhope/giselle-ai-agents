import { getOauthCredential, refreshOauthCredential } from "@/app/(auth)/lib";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/supabase";
import { GitHubUserClient } from "@/services/external/github/user-client";
import { redirectToGitHubAuthorizePage, unlinkIdentity } from "./actions";

function Authorize() {
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

	async function unlinkable() {
		const supabaseUser = await getUser();
		return supabaseUser.identities && supabaseUser.identities.length > 1;
	}

	return (
		<p>
			logged in as {gitHubUser.login}{" "}
			{(await unlinkable()) && (
				<button type="button" onClick={unlinkIdentity}>
					unlink
				</button>
			)}
		</p>
	);
}
