import { SecretId, type TextGenerationNode } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import {
	CheckIcon,
	MoveUpRightIcon,
	PlusIcon,
	Settings2Icon,
} from "lucide-react";
import { Tabs } from "radix-ui";
import {
	type ComponentProps,
	type FormEventHandler,
	type PropsWithChildren,
	type ReactNode,
	useCallback,
	useState,
	useTransition,
} from "react";
import { z } from "zod/v4";
import { GitHubIcon } from "../../../tool";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { DropdownMenu } from "./ui/dropdown-menu";

type UIToolName = "GitHub" | "PostgreSQL";
interface UITool {
	name: UIToolName;
	commands: string[];
}

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

function GitHubToolSetting({ node }: { node: TextGenerationNode }) {
	const [presentDialog, setPresentDialog] = useState(false);
	const { updateNodeDataContent, data } = useWorkflowDesigner();
	const client = useGiselleEngine();
	const [isPending, startTransition] = useTransition();
	const setupGitHubTool = useCallback<FormEventHandler<HTMLFormElement>>(
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
				return;
			}
			const payload = parse.data;
			switch (payload.secretType) {
				case "create":
					{
						startTransition(async () => {
							const result = await client.addSecret({
								workspaceId: data.id,
								label: payload.label,
								value: payload.value,
							});
							updateNodeDataContent(node, {
								...node.content,
								tools: {
									...node.content.tools,
									github: {
										tools: [],
										auth: {
											type: "secret",
											secretId: result.secretId,
										},
									},
								},
							});
							setPresentDialog(false);
						});
					}
					break;
				case "select":
					break;
				default: {
					const _exhaustiveCheck: never = payload;
					throw new Error(`Unhandled secretType: ${_exhaustiveCheck}`);
				}
			}
		},
		[node, updateNodeDataContent, client, data.id],
	);
	return (
		<ToolList.Dialog
			open={presentDialog}
			onOpenChange={setPresentDialog}
			enable={!!node.content.tools?.github}
		>
			<ToolList.DialogHeader
				title="Add GitHub tool"
				description="Choose how you want to provide your GitHub Personal Access Token"
			/>
			<Tabs.Root defaultValue="create">
				<div className="px-[12px]">
					<Tabs.List
						className={clsx(
							"border border-border px-[4px] py-[4px] rounded-[4px] flex justify-center items-center gap-[4px]",
							"**:data-trigger:flex-1 **:data-trigger:rounded-[4px] **:data-trigger:border **:data-trigger:border-transparent",
							"**:data-trigger:outline-none **:data-trigger:text-text-muted **:data-trigger:font-accent",
							"**:data-trigger:text-[13px] **:data-trigger:tracking-wider **:data-trigger:py-[2px]",
							"**:data-trigger:data-[state=active]:bg-tab-active-background **:data-trigger:data-[state=active]:text-text",
							"**:data-trigger:data-[state=inactive]:cursor-pointer",
							"**:data-trigger:hover:bg-ghost-element-hover",
						)}
					>
						<Tabs.Trigger value="create" data-trigger>
							Add New Token
						</Tabs.Trigger>
						<Tabs.Trigger value="select" data-trigger>
							Use Existing Token
						</Tabs.Trigger>
					</Tabs.List>
				</div>
				<div className="h-[12px]" />
				<Tabs.Content value="create" className="outline-none">
					<form onSubmit={setupGitHubTool}>
						<input
							type="hidden"
							name="secretType"
							value={GitHubToolSetupSecretType.create}
						/>
						<div className="flex flex-col gap-[12px] px-[12px]">
							<fieldset className="flex flex-col">
								<label
									htmlFor="label"
									className="text-text text-[13px] mb-[2px]"
								>
									Label
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
									Once registered, this PAT can be referenced from other nodes.
									Enter a label to identify this PAT when referencing it.
								</p>
							</fieldset>
							<fieldset className="flex flex-col">
								<div className="flex justify-between mb-[2px]">
									<label htmlFor="pat" className="text-text text-[13px]">
										PAT
									</label>
									<a
										href="https://github.com/settings/personal-access-tokens"
										className="flex items-center gap-[4px] text-[13px] text-text-muted hover:bg-ghost-element-hover transition-colors px-[4px] rounded-[2px]"
										target="_blank"
										rel="noreferrer"
									>
										<span>GitHub</span>
										<MoveUpRightIcon className="size-[13px]" />
									</a>
								</div>
								<input
									type="text"
									id="pat"
									name="value"
									className={clsx(
										"border border-border rounded-[4px] bg-editor-background outline-none px-[8px] py-[2px] text-[14px]",
										"focus:border-border-focused",
									)}
								/>
								<p className="text-[11px] text-text-muted px-[4px] mt-[1px]">
									The entered PAT will be encrypted and stored using
									authenticated encryption.
								</p>
							</fieldset>
						</div>
						<div className="h-[12px]" />
						<div className="border-t border-border px-[4px] py-[6px] flex justify-end">
							<button
								type="submit"
								className="flex items-center gap-[4px] text-[14px] text-text hover:bg-ghost-element-hover transition-colors px-[8px] rounded-[2px] cursor-pointer"
								disabled={isPending}
							>
								{isPending ? "Adding..." : "Add tool"}
							</button>
						</div>
					</form>
				</Tabs.Content>
				<Tabs.Content value="select" className="outline-none">
					<form onSubmit={setupGitHubTool}>
						<input
							type="hidden"
							name="secretType"
							value={GitHubToolSetupSecretType.create}
						/>
						<div className="px-[12px]">
							<fieldset className="flex flex-col">
								<label
									htmlFor="label"
									className="text-text text-[13px] mb-[2px]"
								>
									Select from your saved secrets
								</label>
								<DropdownMenu
									placeholder="Choose a saved token"
									items={[
										{ id: "token1", label: "Token 1" },
										{ id: "token2", label: "Token 2" },
										{ id: "token3", label: "Token 3" },
									]}
									renderItem={(item) => item.label}
								/>
							</fieldset>
						</div>
						<div className="h-[12px]" />
						<div className="border-t border-border px-[4px] py-[6px] flex justify-end">
							<button
								type="submit"
								className="flex items-center gap-[4px] text-[14px] text-text hover:bg-ghost-element-hover transition-colors px-[8px] rounded-[2px] cursor-pointer"
							>
								Add tool
							</button>
						</div>
					</form>
				</Tabs.Content>
			</Tabs.Root>
		</ToolList.Dialog>
	);
}

export function ToolsPanel({
	node,
}: {
	node: TextGenerationNode;
}) {
	return (
		<div className="text-white-400 space-y-[16px]">
			<ToolList.Item
				icon={<GitHubIcon data-tool-icon />}
				configurationPanel={<GitHubToolSetting node={node} />}
			>
				<div className="flex gap-[10px] items-center">
					<h3 className="text-text text-[14px]">GitHub</h3>
					{node.content.tools?.github && (
						<CheckIcon className="size-[14px] text-success" />
					)}
				</div>
			</ToolList.Item>
		</div>
	);
}

interface ToolListItemProps {
	icon: ReactNode;
	configurationPanel: ReactNode;
}
interface ToolListDialogProps
	extends Omit<ComponentProps<typeof Dialog>, "children"> {
	enable: boolean;
}
interface ToolListDialogHeaderProps {
	title: string;
	description: string;
}
const ToolList = {
	Item({
		children,
		icon,
		configurationPanel,
	}: PropsWithChildren<ToolListItemProps>) {
		return (
			<div
				className={clsx(
					"border border-border rounded-[8px] px-[12px] w-full flex items-center justify-between py-[10px]",
					"**:data-tool-icon:size-[20px] **:data-tool-icon:text-text-muted",
					"**:data-dialog-trigger-icon:size-[14px]",
				)}
			>
				<div className="flex gap-[10px] items-center">
					{icon}
					{children}
				</div>
				{configurationPanel}
			</div>
		);
	},
	Dialog({
		open,
		onOpenChange,
		defaultOpen,
		children,
		enable,
	}: PropsWithChildren<ToolListDialogProps>) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
				<DialogTrigger asChild>
					<Button
						type="button"
						leftIcon={
							enable ? (
								<Settings2Icon data-dialog-trigger-icon />
							) : (
								<PlusIcon data-dialog-trigger-icon />
							)
						}
					>
						{enable ? "Configure" : "Add"}
					</Button>
				</DialogTrigger>
				<DialogContent>{children}</DialogContent>
			</Dialog>
		);
	},
	DialogHeader({ title, description }: ToolListDialogHeaderProps) {
		return (
			<div className="py-[12px]">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</div>
		);
	},
};
