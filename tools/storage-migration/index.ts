import { createClient } from "@supabase/supabase-js";
import { list } from "@vercel/blob";

// ANSI color codes
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",

	fg: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		crimson: "\x1b[38m",
	},

	bg: {
		black: "\x1b[40m",
		red: "\x1b[41m",
		green: "\x1b[42m",
		yellow: "\x1b[43m",
		blue: "\x1b[44m",
		magenta: "\x1b[45m",
		cyan: "\x1b[46m",
		white: "\x1b[47m",
		crimson: "\x1b[48m",
	},
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const vercelBlobKey = process.env.VERCEL_BLOB_KEY;

if (!(supabaseUrl && supabaseKey && vercelBlobKey)) {
	throw new Error("Missing Supabase URL or key");
}

console.log(
	`${colors.bright}${colors.fg.cyan}=== Starting storage migration from Vercel Blob to Supabase ===${colors.reset}`,
);
const supabase = createClient(supabaseUrl, supabaseKey, {});

let cursor: string | undefined;
let totalProcessed = 0;
let successCount = 0;
let alreadyCount = 0;
let errorCount = 0;
let batchNumber = 0;

do {
	batchNumber++;
	console.log(
		`\n${colors.fg.blue}▶ Processing batch #${batchNumber}${colors.reset}`,
	);

	const listResult = await list({
		cursor,
		limit: 20,
		prefix: "private-beta",
		token: vercelBlobKey,
	});

	console.log(
		`${colors.fg.yellow}Found ${listResult.blobs.length} blobs in this batch${colors.reset}`,
	);

	await Promise.all(
		listResult.blobs.map(async (blob) => {
			const originalPathname = blob.pathname;
			const newPathname = blob.pathname.split("/").slice(1).join("/");

			// console.log(
			// 	`${colors.dim}Migrating: ${originalPathname} -> ${newPathname}${colors.reset}`,
			// );

			try {
				const file = await fetch(blob.downloadUrl).then((res) => res.blob());
				const { data, error } = await supabase.storage
					.from("experiment")
					.upload(newPathname, file);

				if (error) {
					if (error.message === "The resource already exists") {
						console.log(
							` ├ ${colors.dim}The resource already exists: ${newPathname}${colors.reset}`,
						);
						alreadyCount++;
					} else {
						console.error(
							` ├ ${colors.fg.red}✘ Error uploading ${newPathname}:${colors.reset}`,
							error,
						);
						errorCount++;
					}
				} else {
					console.log(
						` ├ ${colors.fg.green}✓ Successfully migrated: ${newPathname}${colors.reset}`,
					);
					successCount++;
				}
			} catch (error) {
				console.error(
					` ├ ${colors.fg.red}✘ Exception processing ${newPathname}:${colors.reset}`,
					error,
				);
				errorCount++;
			}

			totalProcessed++;
		}),
	);

	cursor = listResult.cursor;
	console.log(
		`${colors.fg.magenta}Batch #${batchNumber} complete - ${colors.fg.green}Success: ${successCount}${colors.reset}, ${colors.dim}Already: ${alreadyCount}${colors.reset}, ${colors.fg.red}Errors: ${errorCount}${colors.reset}, ${colors.fg.blue}Total: ${totalProcessed}${colors.reset}`,
	);

	if (cursor) {
		console.log(
			`${colors.fg.cyan}Continuing to next batch with cursor: ${cursor.substring(0, 20)}...${colors.reset}`,
		);
	}
} while (cursor);

console.log(
	`\n${colors.bright}${colors.fg.green}✅ Storage migration complete!${colors.reset}`,
);
console.log(
	`${colors.bright}${colors.fg.cyan}Final results: ${colors.reset}${colors.fg.blue}Processed ${totalProcessed} files ${colors.reset}(${colors.fg.green}${successCount} successful${colors.reset}, ${colors.fg.red}${errorCount}, already ${alreadyCount}, failed${colors.reset})`,
);
