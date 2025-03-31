import {
	type CreatedRun,
	type FileNode,
	type GenerationTemplate,
	type GitHubNode,
	type ImageGenerationNode,
	type OverrideNode,
	type QueuedRun,
	type RunId,
	type TextGenerationNode,
	type TextNode,
	type WorkflowId,
	type WorkspaceId,
	isOverrideFileContent,
	isOverrideGitHubContent,
	isOverrideImageGenerationContent,
	isOverrideTextContent,
	isOverrideTextGenerationContent,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleEngineContext } from "../types";
import { getWorkspace } from "../workspaces/utils";
import { setRun } from "./utils";

export function overrideGenerationTemplate(
	template: GenerationTemplate,
	overrideNodes: OverrideNode[],
): GenerationTemplate {
	let overridedTemplate = template;
	for (const overrideNode of overrideNodes) {
		if (overrideNode.id === template.actionNode.id) {
			switch (template.actionNode.content.type) {
				case "textGeneration": {
					if (isOverrideTextGenerationContent(overrideNode.content)) {
						overridedTemplate = {
							...overridedTemplate,
							actionNode: {
								...overridedTemplate.actionNode,
								content: {
									...overridedTemplate.actionNode.content,
									prompt: overrideNode.content.prompt,
								},
							},
						};
					}
					break;
				}
				case "imageGeneration": {
					if (isOverrideImageGenerationContent(overrideNode.content)) {
						overridedTemplate = {
							...overridedTemplate,
							actionNode: {
								...overridedTemplate.actionNode,
								content: {
									...overridedTemplate.actionNode.content,
									prompt: overrideNode.content.prompt,
								},
							},
						};
					}
					break;
				}
				default: {
					const _exhaustiveCheck: never = template.actionNode.content;
					throw new Error(`Unhandled action node type: ${_exhaustiveCheck}`);
				}
			}
		}
		for (const sourceNode of template.sourceNodes) {
			if (overrideNode.id !== sourceNode.id) {
				continue;
			}
			switch (sourceNode.content.type) {
				case "textGeneration": {
					overridedTemplate = {
						...overridedTemplate,
						sourceNodes: overridedTemplate.sourceNodes.map((node) => {
							if (
								node.id === sourceNode.id &&
								isOverrideTextGenerationContent(overrideNode.content)
							) {
								return {
									...node,
									content: {
										...node.content,
										prompt: overrideNode.content.prompt,
									},
								} as TextGenerationNode;
							}
							return node;
						}),
					};
					break;
				}
				case "imageGeneration":
					overridedTemplate = {
						...overridedTemplate,
						sourceNodes: overridedTemplate.sourceNodes.map((node) => {
							if (
								node.id === sourceNode.id &&
								isOverrideImageGenerationContent(overrideNode.content)
							) {
								return {
									...node,
									content: {
										...node.content,
										prompt: overrideNode.content.prompt,
									},
								} as ImageGenerationNode;
							}
							return node;
						}),
					};
					break;
				case "file":
					overridedTemplate = {
						...overridedTemplate,
						sourceNodes: overridedTemplate.sourceNodes.map((node) => {
							if (
								node.id === sourceNode.id &&
								isOverrideFileContent(overrideNode.content)
							) {
								return {
									...node,
									content: {
										...node.content,
										files: overrideNode.content.files,
									},
								} as FileNode;
							}
							return node;
						}),
					};
					break;
				case "text":
					overridedTemplate = {
						...overridedTemplate,
						sourceNodes: overridedTemplate.sourceNodes.map((node) => {
							if (
								node.id === sourceNode.id &&
								isOverrideTextContent(overrideNode.content)
							) {
								return {
									...node,
									content: {
										...node.content,
										text: overrideNode.content.text,
									},
								} as TextNode;
							}
							return node;
						}),
					};
					break;
				case "github":
					overridedTemplate = {
						...overridedTemplate,
						sourceNodes: overridedTemplate.sourceNodes.map((node) => {
							if (
								node.id === sourceNode.id &&
								isOverrideGitHubContent(overrideNode.content)
							) {
								return {
									...node,
									content: {
										...node.content,
										objectReferences: overrideNode.content.objectReferences,
									},
								} as GitHubNode;
							}
							return node;
						}),
					};
					break;
				default: {
					const _exhaustiveCheck: never = sourceNode.content;
					throw new Error(`Unhandled source node type: ${_exhaustiveCheck}`);
				}
			}
		}
	}
	return overridedTemplate;
}

export async function addRun(args: {
	workspaceId: WorkspaceId;
	workflowId: WorkflowId;
	run: CreatedRun;
	overrideNodes: OverrideNode[];
	context: GiselleEngineContext;
}) {
	const workspace = await getWorkspace({
		storage: args.context.storage,
		workspaceId: args.workspaceId,
	});

	if (workspace === undefined) {
		throw new Error("Workspace not found");
	}
	const workflow = workspace.editingWorkflows.find(
		(editingWorkflow) => editingWorkflow.id === args.workflowId,
	);
	if (workflow === undefined) {
		throw new Error("Workflow not found");
	}

	const overrideWorkflow = {
		...workflow,
		jobs: workflow.jobs.map((job) => ({
			...job,
			actions: job.actions.map((action) => ({
				...action,
				generationTemplate: overrideGenerationTemplate(
					action.generationTemplate,
					args.overrideNodes ?? [],
				),
			})),
		})),
	};

	/** @todo upload openai file to vector store */
	const queuedRun = {
		...args.run,
		status: "queued",
		workspaceId: args.workspaceId,
		workflow: overrideWorkflow,
		overrideNodes: args.overrideNodes,
		queuedAt: Date.now(),
	} satisfies QueuedRun;
	await Promise.all([
		setRun({ run: queuedRun, storage: args.context.storage }),
		copyFiles({
			storage: args.context.storage,
			workspaceId: args.workspaceId,
			runId: queuedRun.id,
		}),
	]);
	return queuedRun;
}

async function copyFiles({
	storage,
	workspaceId,
	runId,
}: { storage: Storage; workspaceId: WorkspaceId; runId: RunId }) {
	const fileKeys = await storage.getKeys(`workspaces/${workspaceId}/files`);

	await Promise.all(
		fileKeys.map(async (fileKey) => {
			const file = await storage.getItemRaw(fileKey);
			await storage.setItemRaw(
				fileKey.replace(/workspaces:wrks-\w+:files:/, `runs:${runId}:files:`),
				file,
			);
		}),
	);
}
