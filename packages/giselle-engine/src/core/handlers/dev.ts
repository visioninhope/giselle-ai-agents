import type { GiselleEngineHandlerArgs } from "./types";

export async function devHandler({ context }: GiselleEngineHandlerArgs) {
	const keys = await context.storage.getKeys(
		"workspaces/wrks-pBnFZ5oHcDTZF9n1/files",
	);

	const runId = "rs-test1";
	const test =
		"workspaces:wrks-mguv0iKFqIynruRI:files:fl-KtkZjx7nkjlB6fCa:SaaStr Tips Tricks Ebook Vol 1.pdf";
	const expect =
		"runs:rs-x:files:fl-KtkZjx7nkjlB6fCa:SaaStr Tips Tricks Ebook Vol 1.pdf";
	const replace = test.replace(
		/workspaces:wrks-\w+:files:/,
		"runs:rs-x:files:",
	);
	const dest = keys.map((key) =>
		key.replace(/workspaces:wrks-\w+:files:/, `runs:rs-${runId}:files:`),
	);

	// await Promise.all(
	// 	keys.map(async (source) => {
	// 		const dest = source.replace(
	// 			/workspaces:wrks-\w+:files:/,
	// 			`runs:rs-${runId}:files:`,
	// 		);
	// 		const file = await context.storage.getItemRaw(source);
	// 		await context.storage.setItemRaw(dest, file);
	// 	}),
	// );
	return { keys, dest };
}
