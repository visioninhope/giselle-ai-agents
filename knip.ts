import type { KnipConfig } from "knip";

const config: KnipConfig = {
	biome: false,
	rules: {
		exports: "off",
		classMembers: "off",
		duplicates: "off",
		types: "off",
		binaries: "off",
		unlisted: "off",
		devDependencies: "off",
		dependencies: "off",
	},
	workspaces: {
		"apps/studio.giselles.ai": {
			ignore: ["scripts/**", "tests/e2e/global-setup.ts"],
		},
		"packages/rag": {
			ignore: ["src/chunker/__fixtures__/code-sample.ts"],
		},
	},
	ignore: ["turbo/generators/config.ts"],
};

export default config;
