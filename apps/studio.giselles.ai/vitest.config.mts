import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	// This is a setting that refers to the tsconfig path setting
	plugins: [tsconfigPaths()],
	test: {
		environment: "node",
		exclude: [...configDefaults.exclude, "tests/e2e/**"],
	},
});
