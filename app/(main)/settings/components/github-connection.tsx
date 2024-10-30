import { ClickableText } from "@/components/ui/clicable-text";
import { getUser } from "@/lib/supabase";
import type { GitHubUserClient } from "@/services/external/github/user-client";
import { SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { authorizeGitHub, unlinkIdentity } from "../account/actions";
import {
	GitHubConnectButton,
	type GitHubConnectButtonMode,
} from "./github-connection-button";

type GitHubUser = Awaited<ReturnType<GitHubUserClient["getUser"]>>;

export async function GitHubConnection({
	gitHubUser,
}: {
	gitHubUser?: GitHubUser;
}) {
	const supabaseUser = await getUser();
	const unlinkable =
		supabaseUser.identities && supabaseUser.identities.length > 1;

	let connectMode: GitHubConnectButtonMode = "hidden";
	if (!gitHubUser) {
		connectMode = "connect";
	} else if (unlinkable) {
		connectMode = "disconnect";
	}

	return (
		<div className="bg-transparent rounded-md border border-black-70 py-4 px-4 w-full font-avenir text-black-30">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<SiGithub className="h-[20px] w-[20px]" />
					<div className="flex flex-col">
						<div>GitHub</div>
						{gitHubUser && (
							<div className="text-black-70 text-[12px]">
								{gitHubUser.name} (
								<ClickableText asChild>
									<Link href={gitHubUser.html_url}>@{gitHubUser.login}</Link>
								</ClickableText>
								)
							</div>
						)}
					</div>
				</div>
				<GitHubConnectButton
					mode={connectMode}
					connectAction={authorizeGitHub}
					disconnectAction={unlinkIdentity}
				/>
			</div>
		</div>
	);
}
