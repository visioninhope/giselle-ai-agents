#!/usr/bin/env node --experimental-strip-types

interface Node {
	id: string;
	name: string;
	type: string;
	// biome-ignore lint/suspicious/noExplicitAny: dev tool
	inputs: any[];
	// biome-ignore lint/suspicious/noExplicitAny: dev tool
	outputs: any[];
	content: {
		type: string;
		prompt?: string;
		// biome-ignore lint/suspicious/noExplicitAny: dev tool
		[key: string]: any;
	};
}

interface Workspace {
	id: string;
	name: string;
	schemaVersion: string;
	nodes: Node[];
	// biome-ignore lint/suspicious/noExplicitAny: dev tool
	connections: any[];
	// biome-ignore lint/suspicious/noExplicitAny: dev tool
	ui: any;
}

function convertNodePrompts(workspace: Workspace): Workspace {
	// Create a deep copy of the workspace to avoid mutating the original
	const updatedWorkspace = JSON.parse(JSON.stringify(workspace));

	// Iterate through all nodes
	updatedWorkspace.nodes.forEach((node: Node) => {
		// Check if the node has content with a prompt property
		if (node.content && node.content.prompt !== undefined) {
			// Replace the prompt with {nodeid.nodename} format
			node.content.prompt = `id: ${node.id}, name: ${node.name}`;
		}
		// Check if the node has content with a text property
		if (node.content && node.content.text !== undefined) {
			// Replace the prompt with {nodeid.nodename} format
			node.content.text = `id: ${node.id}, name: ${node.name}`;
		}
	});

	// Strip UI nodeState to minimal empty object
	if (updatedWorkspace.ui) {
		updatedWorkspace.ui = { ...updatedWorkspace.ui, nodeState: {} };
	}

	return updatedWorkspace;
}

// CLI function to read from stdin and write to stdout
async function cli(): Promise<void> {
	try {
		// Read from stdin
		let inputData = "";

		process.stdin.setEncoding("utf8");

		for await (const chunk of process.stdin) {
			inputData += chunk;
		}

		// Parse the JSON
		const workspace: Workspace = JSON.parse(inputData);

		// Convert the prompts
		const updatedWorkspace = convertNodePrompts(workspace);

		// Output to stdout
		console.log(JSON.stringify(updatedWorkspace, null, 2));
	} catch (error) {
		console.error(
			"Error:",
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exit(1);
	}
}

// Run CLI if this is the main module
if (import.meta.url.startsWith("file:")) {
	cli();
}

export type { Workspace, Node };
