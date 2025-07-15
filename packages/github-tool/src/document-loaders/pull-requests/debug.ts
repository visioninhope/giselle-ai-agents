#!/usr/bin/env node

import { Octokit } from "@octokit/core";
import type { GitHubAuthConfig } from "../../types.js";
import { createGitHubPullRequestsLoader } from "./loader.js";

async function testLoader() {
	// GitHub token from environment variable
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		console.error("Please set GITHUB_TOKEN environment variable");
		process.exit(1);
	}

	// Get repo info from command line args or use defaults
	const [owner = "giselles-ai", repo = "giselle"] = process.argv.slice(2);

	console.log(`Testing GitHub Pull Requests Loader`);
	console.log(`Repository: ${owner}/${repo}`);
	console.log("=====================================\n");

	try {
		const octokit = new Octokit({ auth: token });
		const authConfig: GitHubAuthConfig = {
			strategy: "personal-access-token",
			personalAccessToken: token,
		};

		// Create loader (only processes merged PRs)
		const loader = createGitHubPullRequestsLoader(
			octokit,
			{
				// Repository
				owner,
				repo,

				// Pagination
				perPage: 3, // Small number for testing
				maxPages: 3,

				// Processing options
				maxContentLength: 1024 * 5, // 5KB limit for testing
			},
			authConfig,
		);

		console.log("🔍 Loading metadata...");
		const metadataList = [];
		const prDocCounts = new Map<number, number>();

		for await (const metadata of loader.loadMetadata()) {
			metadataList.push(metadata);
			const count = prDocCounts.get(metadata.pr_number) || 0;
			prDocCounts.set(metadata.pr_number, count + 1);

			console.log(`  ✓ Metadata loaded:`);
			console.log(`    - pr_number: ${metadata.pr_number}`);
			console.log(`    - content_type: ${metadata.content_type}`);
			console.log(`    - content_id: ${metadata.content_id}`);
			console.log(`    - merged_at: ${metadata.merged_at}`);
		}

		console.log(`\n📊 Summary:`);
		console.log(`  - Total documents: ${metadataList.length}`);
		console.log(`  - Unique PRs: ${prDocCounts.size}`);
		console.log(`  - Document types breakdown:`);
		const typeCount = metadataList.reduce(
			(acc, m) => {
				acc[m.content_type] = (acc[m.content_type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);
		for (const [type, count] of Object.entries(typeCount)) {
			console.log(`    - ${type}: ${count}`);
		}

		// Test loading sample documents
		console.log("\n📖 Testing loadDocument function...");

		// Test title_body documents
		const titleBodyDocs = metadataList
			.filter((m) => m.content_type === "title_body")
			.slice(0, 2);
		if (titleBodyDocs.length > 0) {
			console.log("\n🔹 Title/Body Documents:");
			for (const metadata of titleBodyDocs) {
				const doc = await loader.loadDocument(metadata);
				if (doc) {
					console.log(
						`  ✓ PR #${metadata.pr_number}: Loaded ${doc.content.length} chars`,
					);
					const lines = doc.content.split("\n");
					console.log(`    Title: ${lines[0]}`);
					console.log(`    Body (first 5 lines):`);
					lines.slice(2, 7).forEach((line) => {
						console.log(`      ${line}`);
					});
				}
			}
		}

		// Test comment documents
		const commentDocs = metadataList
			.filter((m) => m.content_type === "comment")
			.slice(0, 2);
		if (commentDocs.length > 0) {
			console.log("\n🔹 Comment Documents:");
			for (const metadata of commentDocs) {
				const doc = await loader.loadDocument(metadata);
				if (doc) {
					console.log(
						`  ✓ PR #${metadata.pr_number}, Comment ${metadata.content_id}: ${doc.content.length} chars`,
					);
					console.log(`    Comment content (first 5 lines):`);
					const lines = doc.content.split("\n").slice(0, 5);
					lines.forEach((line) => {
						console.log(`      ${line}`);
					});
				}
			}
		}

		// Test diff documents and GitHub's binary/generated detection
		const diffDocs = metadataList
			.filter((m) => m.content_type === "diff")
			.slice(0, 5);
		if (diffDocs.length > 0) {
			console.log(
				"\n🔹 Diff Documents (testing GitHub's binary/generated detection):",
			);
			for (const metadata of diffDocs) {
				const doc = await loader.loadDocument(metadata);
				if (doc) {
					console.log(
						`  ✓ PR #${metadata.pr_number}, File: ${metadata.content_id}`,
					);
					console.log(`    Loaded: ${doc.content.length} chars`);
					console.log(`    Diff content (first 5 lines):`);
					const lines = doc.content.split("\n").slice(0, 5);
					lines.forEach((line) => {
						console.log(`      ${line}`);
					});
				} else {
					console.log(
						`  ✗ PR #${metadata.pr_number}, File: ${metadata.content_id}`,
					);
					console.log(`    Skipped (GitHub detected as binary/generated)`);
				}
			}
		}

		console.log("\n✅ Test completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
}

testLoader();
