import type { KnipConfig } from "knip";

const config: KnipConfig = {
	biome: false,
	rules: {
		files: "off",
		exports: "off",
		classMembers: "off",
		duplicates: "off",
		types: "off",
		binaries: "off",
		unlisted: "off",
		devDependencies: "off",
		dependencies: "off",
	},
};

export default config;
