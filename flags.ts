import { unstable_flag as flag } from "@vercel/flags/next";

export const uploadFileToPromptNodeFlag = flag<boolean>({
	key: "upload-file-to-prompt-node",
	async decide() {
		// You can do async things in here like reading edge config or querying
		// your feature flag provider.
		//
		// You can access data passed in by middleware through unstable_getPrecomputationContext
		// const context = unstable_getPrecomputationContext()
		//
		// This is great for creating a single instance of your flag provider
		// and then passing the client down from middleware
		return false;
	},
	description: "User can upload a file to the prompt node",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const webSearchNodeFlag = flag<boolean>({
	key: "web-search-node",
	async decide() {
		// You can do async things in here like reading edge config or querying
		// your feature flag provider.
		//
		// You can access data passed in by middleware through unstable_getPrecomputationContext
		// const context = unstable_getPrecomputationContext()
		//
		// This is great for creating a single instance of your flag provider
		// and then passing the client down from middleware
		return false;
	},
	description: "User can use a web search node",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});

export const debugFlag = flag<boolean>({
	key: "debug",
	async decide() {
		return false;
	},
	description: "Enable debug mode",
	defaultValue: false,
	options: [
		{ value: false, label: "disable" },
		{ value: true, label: "Enable" },
	],
});
