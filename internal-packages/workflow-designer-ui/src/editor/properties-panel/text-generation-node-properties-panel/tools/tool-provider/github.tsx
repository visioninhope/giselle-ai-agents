import { Button } from "@giselle-internal/ui/button";
import { EmptyState } from "@giselle-internal/ui/empty-state";
import { Select } from "@giselle-internal/ui/select";
import { SecretId, type TextGenerationNode } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { MoveUpRightIcon, PlusIcon } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import z from "zod/v4";
import { useWorkspaceSecrets } from "../../../../lib/use-workspace-secrets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ToolConfigurationDialog } from "../ui/tool-configuration-dialog";

const GitHubToolSetupSecretType = {
	create: "create",
	select: "select",
} as const;
const GitHubToolSetupPayload = z.discriminatedUnion("secretType", [
	z.object({
		secretType: z.literal(GitHubToolSetupSecretType.create),
		label: z.string().min(1),
		value: z.string().min(1),
	}),
	z.object({
		secretType: z.literal(GitHubToolSetupSecretType.select),
		secretId: SecretId.schema,
	}),
]);

export function GitHubToolConfigurationDialog({
	node,
}: { node: TextGenerationNode }) {
	const [presentDialog, setPresentDialog] = useState(false);
	const [tabValue, setTabValue] = useState("create");
	const { updateNodeDataContent, data: workspace } = useWorkflowDesigner();
	const { isLoading, data, mutate } = useWorkspaceSecrets();
	const client = useGiselleEngine();
	const [isPending, startTransition] = useTransition();
	const setupGitHubTool = useCallback<React.FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const secretType = formData.get("secretType");
			const label = formData.get("label");
			const value = formData.get("value");
			const secretId = formData.get("secretId");
			const parse = GitHubToolSetupPayload.safeParse({
				secretType,
				label,
				value,
				secretId,
			});
			if (!parse.success) {
				/** @todo Implement error handling */
				console.log(parse.error);
				return;
			}
			const payload = parse.data;
			switch (payload.secretType) {
				case "create":
					startTransition(async () => {
						const result = await client.addSecret({
							workspaceId: workspace.id,
							label: payload.label,
							value: payload.value,
						});
						mutate([...(data ?? []), result.secret]);
						updateNodeDataContent(node, {
							...node.content,
							tools: {
								...node.content.tools,
								github: {
									tools: [],
									auth: {
										type: "secret",
										secretId: result.secret.id,
									},
								},
							},
						});
					});
					break;
				case "select":
					updateNodeDataContent(node, {
						...node.content,
						tools: {
							...node.content.tools,
							github: {
								tools: [],
								auth: {
									type: "secret",
									secretId: payload.secretId,
								},
							},
						},
					});
					break;
				default: {
					const _exhaustiveCheck: never = payload;
					throw new Error(`Unhandled secretType: ${_exhaustiveCheck}`);
				}
			}
			setPresentDialog(false);
		},
		[node, updateNodeDataContent, client, workspace.id, data, mutate],
	);
	return (
		<ToolConfigurationDialog
			title="Connect to GitHub"
			description="How would you like to add your Personal Access Token (PAT)?"
			onSubmit={setupGitHubTool}
			submitting={isPending}
			trigger={
				<Button type="button" leftIcon={<PlusIcon data-dialog-trigger-icon />}>
					Connect
				</Button>
			}
			open={presentDialog}
			onOpenChange={setPresentDialog}
		>
			<Tabs value={tabValue} onValueChange={setTabValue}>
				<TabsList className="mb-[12px]">
					<TabsTrigger value="create">Paste New Token</TabsTrigger>
					<TabsTrigger value="select">Use Saved Token</TabsTrigger>
				</TabsList>
				<TabsContent value="create">
					<input
						type="hidden"
						name="secretType"
						value={GitHubToolSetupSecretType.create}
					/>
					<div className="flex flex-col gap-[12px]">
						<fieldset className="flex flex-col">
							<label htmlFor="label" className="text-text text-[13px] mb-[2px]">
								Token Name
							</label>
							<input
								type="text"
								id="label"
								name="label"
								className={clsx(
									"border border-border rounded-[4px] bg-editor-background outline-none px-[8px] py-[2px] text-[14px]",
									"focus:border-border-focused",
								)}
							/>
							<p className="text-[11px] text-text-muted px-[4px] mt-[1px]">
								Give this token a short name (e.g. “Prod-bot”). You’ll use it
								when linking other nodes.
							</p>
						</fieldset>
						<fieldset className="flex flex-col">
							<div className="flex justify-between mb-[2px]">
								<label htmlFor="pat" className="text-text text-[13px]">
									Personal Access Token (PAT)
								</label>
								<a
									href="https://github.com/settings/personal-access-tokens"
									className="flex items-center gap-[4px] text-[13px] text-text-muted hover:bg-ghost-element-hover transition-colors px-[4px] rounded-[2px]"
									target="_blank"
									rel="noreferrer"
									tabIndex={-1}
								>
									<span>GitHub</span>
									<MoveUpRightIcon className="size-[13px]" />
								</a>
							</div>
							<input
								type="password"
								autoComplete="off"
								data-1p-ignore
								data-lpignore="true"
								id="pat"
								name="value"
								className={clsx(
									"border border-border rounded-[4px] bg-editor-background outline-none px-[8px] py-[2px] text-[14px]",
									"focus:border-border-focused",
								)}
							/>
							<p className="text-[11px] text-text-muted px-[4px] mt-[1px]">
								We’ll encrypt the token with authenticated encryption before
								saving it.
							</p>
						</fieldset>
					</div>
				</TabsContent>
				<TabsContent value="select">
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<>
							{(data ?? []).length < 1 ? (
								<EmptyState description="No saved tokens yet">
									<Button
										onClick={() => setTabValue("create")}
										leftIcon={<PlusIcon />}
									>
										Save First Token
									</Button>
								</EmptyState>
							) : (
								<>
									<p className="text-[11px] text-text-muted my-[4px]">
										Pick one of your encrypted tokens to connect.
									</p>
									<input
										type="hidden"
										name="secretType"
										value={GitHubToolSetupSecretType.select}
									/>
									<fieldset className="flex flex-col">
										<label
											htmlFor="label"
											className="text-text text-[13px] mb-[2px]"
										>
											Select a saved token
										</label>
										<div>
											<Select
												name="secretId"
												placeholder="Choose a token… "
												options={data ?? []}
												renderOption={(option) => option.label}
												widthClassName="w-[180px]"
											/>
										</div>
									</fieldset>
								</>
							)}
						</>
					)}
				</TabsContent>
			</Tabs>
		</ToolConfigurationDialog>
	);
}
