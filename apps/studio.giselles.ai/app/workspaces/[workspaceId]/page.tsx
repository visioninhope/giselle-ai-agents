import { githubToolsFlag } from "@/flags";
import Page from "./page.client";

export default async function () {
	const githubTools = await githubToolsFlag();

	return <Page githubTools={githubTools} />;
}
