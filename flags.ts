import { unstable_flag as flag } from "@vercel/flags/next";

function takeLocalEnv(localEnvironemntKey: string) {
	if (process.env.NODE_ENV !== "development") {
		return false;
	}
	if (
		process.env[localEnvironemntKey] === undefined ||
		process.env[localEnvironemntKey] === "false"
	) {
		return false;
	}
	return true;
}

export const debugFlag = flag<boolean>({
	key: "debug",
	async decide() {
		return takeLocalEnv("DEBUG_FLAG");
	},
	description: "Enable debug mode",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const viewFlag = flag<boolean>({
	key: "view",
	async decide() {
		return takeLocalEnv("VIEW_FLAG");
	},
	description: "Enable view mode",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const playgroundV2Flag = flag<boolean>({
	key: "playground-v2",
	async decide() {
		return takeLocalEnv("PLAYGROUND_V2_FLAG");
	},
	description: "Enable Playground V2",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const developerFlag = flag<boolean>({
	key: "developer",
	async decide() {
		return takeLocalEnv("DEVELOPER_FLAG");
	},
	description: "Enable Developer",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});
