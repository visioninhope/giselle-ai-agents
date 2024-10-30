import { getAuthCallbackUrl } from "@/app/(auth)/lib";
import { getOauthCredential } from "@/app/(auth)/lib/get-oauth-credential";
import { refreshOauthCredential } from "@/app/(auth)/lib/refresh-oauth-credential";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import {
  GitHubUserClient
} from "@/services/external/github/user-client";
import { redirect } from "next/navigation";

function Authorize() {
  async function redirectToGitHubAuthorizePage() {
    "use server";

    const supabase = await createClient();
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        redirectTo: getAuthCallbackUrl(),
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
  if (!gitHubUser) {
    return <Authorize />;
  }

  return <p>logged in as {gitHubUser.login}</p>;
}
