import { githubIntegrationFlag } from "@/flags";
import { GitHubIntegration } from "./github-integration";

export default async function IntegrationPage() {
	const displayGitHubIntegration = await githubIntegrationFlag();
	if (!displayGitHubIntegration) {
		return null;
	}
	return (
		<div className="grid gap-[16px]">
			<h3
				className="text-[32px] text-black--30 font-rosart"
				style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
			>
				Integration
			</h3>
			<GitHubIntegration />
		</div>
	);
}
