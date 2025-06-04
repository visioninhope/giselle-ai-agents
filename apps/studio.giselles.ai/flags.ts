import { flag } from "flags/next";

function takeLocalEnv(localEnvironmentKey: string) {
	if (process.env.NODE_ENV !== "development") {
		return false;
	}
	if (
		process.env[localEnvironmentKey] === undefined ||
		process.env[localEnvironmentKey] === "false"
	) {
		return false;
	}
	return true;
}

export const developerFlag = flag<boolean>({
	key: "developer",
	decide() {
		return takeLocalEnv("DEVELOPER_FLAG");
	},
	description: "Enable Developer",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const githubToolsFlag = flag<boolean>({
	key: "github-tools",
	decide() {
		return takeLocalEnv("GITHUB_TOOLS_FLAG");
	},
	description: "Enable GitHub Tools",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const githubVectorStoreFlag = flag<boolean>({
	key: "github-vector-store",
	decide() {
		return takeLocalEnv("GITHUB_VECTOR_STORE_FLAG");
	},
	description: "Enable GitHub Vector Store",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const webPageFileNodeFlag = flag<boolean>({
	key: "web-page-file-node",
	decide() {
		return takeLocalEnv("WEB_PAGE_FILE_NODE_FLAG");
	},
	description: "Enable Web Page File Node",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});
