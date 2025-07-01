import { Button } from "@giselle-internal/ui/button";
import { EmptyState } from "@giselle-internal/ui/empty-state";
import { Select } from "@giselle-internal/ui/select";
import { SecretId, type TextGenerationNode } from "@giselle-sdk/data-type";
import {
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import clsx from "clsx/lite";
import { CheckIcon, PlusIcon, Settings2Icon, TrashIcon } from "lucide-react";
import { Checkbox } from "radix-ui";
import { useCallback, useMemo, useState, useTransition } from "react";
import z from "zod/v4";
import { useWorkspaceSecrets } from "../../../../lib/use-workspace-secrets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
	ToolConfigurationDialog,
	type ToolConfigurationDialogProps,
} from "../ui/tool-configuration-dialog";

const PostgresToolSetupSecretType = {
	create: "create",
	select: "select",
} as const;
const PostgresToolSetupPayload = z.discriminatedUnion("secretType", [
	z.object({
		secretType: z.literal(PostgresToolSetupSecretType.create),
		label: z.string().min(1),
		value: z.string().min(1),
	}),
	z.object({
		secretType: z.literal(PostgresToolSetupSecretType.select),
		secretId: SecretId.schema,
	}),
]);

export function PostgresToolConfigurationDialog({
	node,
}: { node: TextGenerationNode }) {
	const [presentDialog, setPresentDialog] = useState(false);
	const connected = useMemo(() => !node.content.tools?.postgres, [node]);

	if (connected) {
		return (
			<PostgresToolConnectionDialog
				node={node}
				open={presentDialog}
				onOpenChange={setPresentDialog}
			/>
		);
	}

	return (
		<PostgresToolConfigurationDialogInternal
			node={node}
			open={presentDialog}
			onOpenChange={setPresentDialog}
		/>
	);
}

function PostgresToolConnectionDialog({
	node,
	open,
	onOpenChange,
}: Pick<ToolConfigurationDialogProps, "open" | "onOpenChange"> & {
	node: TextGenerationNode;
}) {
	const [tabValue, setTabValue] = useState("create");
	const { updateNodeDataContent, data: workspace } = useWorkflowDesigner();
	const { isLoading, data, mutate } = useWorkspaceSecrets();
	const client = useGiselleEngine();
	const [isPending, startTransition] = useTransition();
	const setupPostgresTool = useCallback<
		React.FormEventHandler<HTMLFormElement>
	>(
		(e) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const secretType = formData.get("secretType");
			const label = formData.get("label");
			const value = formData.get("value");
			const secretId = formData.get("secretId");
			const parse = PostgresToolSetupPayload.safeParse({
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
								postgres: {
									tools: [],
									secretId: result.secret.id,
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
							postgres: {
								tools: [],
								secretId: payload.secretId,
							},
						},
					});
					break;
				default: {
					const _exhaustiveCheck: never = payload;
					throw new Error(`Unhandled secretType: ${_exhaustiveCheck}`);
				}
			}
		},
		[node, updateNodeDataContent, client, workspace.id, data, mutate],
	);
	return (
		<ToolConfigurationDialog
			title="Connect to PostgreSQL"
			description="How would you like to set database url?"
			onSubmit={setupPostgresTool}
			submitting={isPending}
			trigger={
				<Button type="button" leftIcon={<PlusIcon data-dialog-trigger-icon />}>
					Connect
				</Button>
			}
			open={open}
			onOpenChange={onOpenChange}
		>
			<Tabs value={tabValue} onValueChange={setTabValue}>
				<TabsList className="mb-[12px]">
					<TabsTrigger value="create">Paste conncetion string</TabsTrigger>
					<TabsTrigger value="select">Use Saved string</TabsTrigger>
				</TabsList>
				<TabsContent value="create">
					<input
						type="hidden"
						name="secretType"
						value={PostgresToolSetupSecretType.create}
					/>
					<div className="flex flex-col gap-[12px]">
						<fieldset className="flex flex-col">
							<label htmlFor="label" className="text-text text-[13px] mb-[2px]">
								Connection Name
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
								Give this onnection a short name (e.g. “Prod-DB”). You’ll use it
								when linking other nodes.
							</p>
						</fieldset>
						<fieldset className="flex flex-col">
							<div className="flex justify-between mb-[2px]">
								<label htmlFor="pat" className="text-text text-[13px]">
									Connection String
								</label>
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
								We’ll encrypt the connection string with authenticated
								encryption before saving it.
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
										Save First connection string
									</Button>
								</EmptyState>
							) : (
								<>
									<p className="text-[11px] text-text-muted my-[4px]">
										Pick one of your encrypted string to connect.
									</p>
									<input
										type="hidden"
										name="secretType"
										value={PostgresToolSetupSecretType.select}
									/>
									<fieldset className="flex flex-col">
										<label
											htmlFor="label"
											className="text-text text-[13px] mb-[2px]"
										>
											Select a saved connection string
										</label>
										<div>
											<Select
												name="secretId"
												placeholder="Choose a connection string… "
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

const postgresToolCatalog = [
	{
		label: "Schema",
		tools: ["getTableStructure"],
	},
	{
		label: "Query",
		tools: ["query"],
	},
];

function PostgresToolConfigurationDialogInternal({
	node,
	open,
	onOpenChange,
}: Pick<ToolConfigurationDialogProps, "open" | "onOpenChange"> & {
	node: TextGenerationNode;
}) {
	const { updateNodeDataContent } = useWorkflowDesigner();

	const updateAvailableTools = useCallback<
		React.FormEventHandler<HTMLFormElement>
	>(
		(e) => {
			e.preventDefault();
			if (node.content.tools?.postgres === undefined) {
				return;
			}
			const formData = new FormData(e.currentTarget);

			const tools = formData
				.getAll("tools")
				.filter((tool) => typeof tool === "string");
			updateNodeDataContent(node, {
				...node.content,
				tools: {
					...node.content.tools,
					postgres: {
						...node.content.tools.postgres,
						tools,
					},
				},
			});
			onOpenChange?.(false);
		},
		[node, updateNodeDataContent, onOpenChange],
	);

	return (
		<ToolConfigurationDialog
			title="Configuration of GitHub"
			description="Select the GitHub tools you want to enable"
			onSubmit={updateAvailableTools}
			submitting={false}
			trigger={
				<Button
					type="button"
					leftIcon={<Settings2Icon data-dialog-trigger-icon />}
				>
					Configuration
				</Button>
			}
			open={open}
			onOpenChange={onOpenChange}
		>
			<div className="flex flex-col">
				<div className="flex justify-between items-center border border-border rounded-[4px] px-[6px] py-[3px] text-[13px] mb-[16px]">
					<div className="flex gap-[6px] items-center">
						<CheckIcon className="size-[14px] text-green-900" />
						Connection configured.
					</div>
					<Button
						type="button"
						onClick={() => {
							updateNodeDataContent(node, {
								...node.content,
								tools: {
									...node.content.tools,
									postgres: undefined,
								},
							});
						}}
						leftIcon={<TrashIcon className="size-[12px]" />}
						size="compact"
					>
						Reset
					</Button>
				</div>
				<div className="flex flex-col gap-6">
					{postgresToolCatalog.map((category) => (
						<div key={category.label} className="flex flex-col gap-2">
							<div className="text-[13px] font-medium text-text">
								{category.label}
							</div>
							<div className="flex flex-col gap-1 border border-border-variant rounded-[4px] overflow-hidden">
								{category.tools.map((tool) => (
									<label
										key={tool}
										className="flex items-center justify-between p-3 hover:bg-black-800/30 cursor-pointer transition-colors"
										htmlFor={tool}
									>
										<Checkbox.Root
											className="group appearance-none size-[18px] rounded border flex items-center justify-center transition-colors outline-none data-[state=checked]:border-success data-[state=checked]:bg-success"
											value={tool}
											id={tool}
											defaultChecked={node.content.tools?.postgres?.tools.includes(
												tool,
											)}
											name="tools"
										>
											<Checkbox.Indicator className="text-background">
												<CheckIcon className="size-[16px]" />
											</Checkbox.Indicator>
										</Checkbox.Root>
										<p className="text-sm text-text flex-1 pl-[8px]">{tool}</p>
									</label>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</ToolConfigurationDialog>
	);
}
