import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["cjs", "esm"],
		dts: true,
		sourcemap: true,
	},
	{
		entry: ["src/next/index.ts"],
		outDir: "next/dist",
		format: ["cjs", "esm"],
		dts: true,
		sourcemap: true,
	},
	{
		entry: ["src/core/schema/index.ts"],
		outDir: "schema/dist",
		format: ["cjs", "esm"],
		dts: true,
		sourcemap: true,
	},
	{
		entry: ["src/client/index.ts"],
		outDir: "client/dist",
		format: ["cjs", "esm"],
		dts: true,
		sourcemap: true,
	},
]);
