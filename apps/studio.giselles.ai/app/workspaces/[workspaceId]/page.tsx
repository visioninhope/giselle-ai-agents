import Page from "./page.client";

export default async function () {
	return (
		<Page
			// Enable if we implement encryption
			githubTools={false}
		/>
	);
}
