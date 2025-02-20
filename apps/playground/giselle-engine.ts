import { NextGiselleEngine } from "giselle-sdk/next";

import { createStorage } from "unstorage";
// import fsDriver from "unstorage/drivers/fs";
import vercelBlobDriver from "unstorage/drivers/vercel-blob";

const storage = createStorage({
	// driver: fsDriver({
	// 	base: "./.storage",
	// }),
	driver: vercelBlobDriver({
		access: "public",
		base: "private-beta",
	}),
});

export const giselleEngine = NextGiselleEngine({
	basePath: "/api/giselle",
	storage,
	llmProviders: ["openai", "anthropic", "google"],
});
