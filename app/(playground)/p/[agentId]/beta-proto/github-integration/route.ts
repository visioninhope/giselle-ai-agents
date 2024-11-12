
async function fetchGitHubRepositories(): Promise<{needsAuthorization: boolean; repositories: Repository[]}> {
  const credential = await getOauthCredential("github");
	if (!credential) {
		return {needsAuthorization: true, repositories: []};
	}

	let repositories: Awaited<ReturnType<GitHubUserClient["getRepositories"]>>["repositories"] = [];
	const gitHubClient = buildGitHubUserClient(credential);
	const {installations} = await gitHubClient.getInstallations();
	for (const installation of installations) {
		const { repositories } = await gitHubClient.getRepositories(installation.id);
		repositories.push(...repositories.flat());
	}

	return {needsAuthorization: false, repositories};
}
