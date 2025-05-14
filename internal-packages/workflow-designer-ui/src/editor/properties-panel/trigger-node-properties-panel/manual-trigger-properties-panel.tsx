import {
	type Output,
	OutputId,
	type TriggerNode,
} from "@giselle-sdk/data-type";
import { triggers } from "@giselle-sdk/flow";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { SpinnerIcon } from "../../../icons";
import { ConfiguredView } from "./ui";

// This is just for internal type checking - the actual configuration structure
// will be properly handled through type assertions
type ManualTriggerParameter = {
	name: string;
	type: "string" | "number" | "boolean";
	required: boolean;
};

// Define a type for manual trigger configuration that can be used with the API
type GitHubOrManualConfiguration = {
	provider: "github" | "manual";
	event: {
		id: string;
		parameters?: Array<ManualTriggerParameter>;
		conditions?: Record<string, string>;
	};
	repositoryNodeId: string;
	installationId: number;
};

interface ManualParameter {
	id: string;
	name: string;
	type: "string" | "number" | "boolean";
	required: boolean;
}

export function ManualTriggerPropertiesPanel({ node }: { node: TriggerNode }) {
	const { data: workspace, updateNodeData } = useWorkflowDesigner();
	const client = useGiselleEngine();
	const [isPending, startTransition] = useTransition();
	const [parameters, setParameters] = useState<ManualParameter[]>([]);
	const [newParameter, setNewParameter] = useState<{
		name: string;
		type: "string" | "number" | "boolean";
		required: boolean;
	}>({
		name: "",
		type: "string",
		required: true,
	});

	// Load existing parameters if configured
	useEffect(() => {
		if (node.content.state.status === "configured") {
			// Here you would fetch existing parameters if needed
			// For now we'll just use what's in the node outputs
			const paramOutputs = node.outputs.filter(
				(output) => output.accessor && typeof output.accessor === "string",
			);

			setParameters(
				paramOutputs.map((output) => ({
					id: output.id,
					name: output.label || "",
					type: "string", // Default type - could be stored in metadata
					required: true, // Default value
				})),
			);
		}
	}, [node]);

	const handleAddParameter = useCallback(() => {
		if (newParameter.name.trim() === "") return;

		setParameters((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				...newParameter,
			},
		]);

		setNewParameter({
			name: "",
			type: "string",
			required: true,
		});
	}, [newParameter]);

	const handleRemoveParameter = useCallback((id: string) => {
		setParameters((prev) => prev.filter((param) => param.id !== id));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (parameters.length === 0) {
			return;
		}

		// Generate outputs based on parameters
		const outputs: Output[] = parameters.map((param) => ({
			id: OutputId.generate(),
			label: param.name,
			accessor: param.name.toLowerCase().replace(/\s+/g, "_"),
		}));

		// Find the manual trigger definition
		const manualTrigger = triggers.find(
			(trigger) => trigger.provider === "manual",
		);
		if (!manualTrigger) {
			throw new Error("Manual trigger not found");
		}

		startTransition(async () => {
			// Configure the trigger on the server
			// Need to type cast here because the flow engine expects either GitHub or Manual configuration
			// but the type system only recognizes GitHub configurations
			const { triggerId } = await client.configureTrigger({
				trigger: {
					nodeId: node.id,
					workspaceId: workspace?.id,
					enable: true,
					// Use type assertion to bypass type checking for the configuration
					// This is necessary because the APIs aren't fully aligned yet
					configuration: {
						provider: "manual",
						event: {
							id: "manual",
							parameters: parameters.map((param) => ({
								name: param.name,
								type: param.type,
								required: param.required,
							})),
						},
						// These properties aren't used for manual triggers but are required by the type system
						repositoryNodeId: "",
						installationId: 0,
					} as GitHubOrManualConfiguration,
				},
			});

			// Update the node in the UI
			updateNodeData(node, {
				content: {
					...node.content,
					state: {
						status: "configured",
						flowTriggerId: triggerId,
					},
				},
				outputs,
				name: "Manual Trigger",
			});
		});
	}, [parameters, client, node, workspace?.id, updateNodeData]);

	if (node.content.state.status === "configured") {
		return <ConfiguredView flowTriggerId={node.content.state.flowTriggerId} />;
	}

	return (
		<div className="flex flex-col gap-[16px] px-[16px] py-[16px]">
			<p className="text-[18px]">Configure Manual Trigger Parameters</p>
			<p className="text-[14px]">
				Add parameters that will be requested when this flow is manually
				triggered.
			</p>

			<div className="flex flex-col gap-[8px]">
				<p className="text-[16px] font-medium">Parameters</p>

				{/* List of configured parameters */}
				{parameters.length > 0 ? (
					<div className="flex flex-col gap-[8px] mb-[16px]">
						{parameters.map((param) => (
							<div
								key={param.id}
								className="flex items-center justify-between p-[8px] bg-white-900/10 rounded-[4px]"
							>
								<div className="flex items-center gap-[8px]">
									<span className="font-medium">{param.name}</span>
									<span className="text-[12px] text-black-500">
										{param.type}
										{param.required ? " (required)" : ""}
									</span>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveParameter(param.id)}
									className="text-black-500 hover:text-black-900"
								>
									<TrashIcon className="size-[16px]" />
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="text-[14px] text-black-500 mb-[16px]">
						No parameters configured yet. Add at least one parameter.
					</div>
				)}

				{/* Add new parameter form */}
				<div className="flex flex-col gap-[8px] p-[12px] border border-white-800 rounded-[8px]">
					<p className="text-[14px] font-medium">Add New Parameter</p>
					<div className="flex gap-[8px] items-end">
						<div className="flex-1">
							<label
								htmlFor="param-name"
								className="text-[12px] text-black-500 mb-[4px] block"
							>
								Parameter Name
							</label>
							<input
								id="param-name"
								type="text"
								value={newParameter.name}
								onChange={(e) =>
									setNewParameter((prev) => ({ ...prev, name: e.target.value }))
								}
								placeholder="e.g., Title, Message, Priority"
								className={clsx(
									"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
									"border-[1px] border-white-900",
									"text-[14px]",
								)}
							/>
						</div>
						<div className="w-[100px]">
							<label
								htmlFor="param-type"
								className="text-[12px] text-black-500 mb-[4px] block"
							>
								Type
							</label>
							<select
								id="param-type"
								value={newParameter.type}
								onChange={(e) =>
									setNewParameter((prev) => ({
										...prev,
										type: e.target.value as "string" | "number" | "boolean",
									}))
								}
								className={clsx(
									"w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none",
									"border-[1px] border-white-900",
									"text-[14px]",
								)}
							>
								<option value="string">Text</option>
								<option value="number">Number</option>
								<option value="boolean">Yes/No</option>
							</select>
						</div>
						<div className="flex items-center h-[42px] ml-[4px]">
							<label
								htmlFor="param-required"
								className="flex items-center gap-[4px] cursor-pointer"
							>
								<input
									id="param-required"
									type="checkbox"
									checked={newParameter.required}
									onChange={(e) =>
										setNewParameter((prev) => ({
											...prev,
											required: e.target.checked,
										}))
									}
								/>
								<span className="text-[12px]">Required</span>
							</label>
						</div>
						<button
							type="button"
							onClick={handleAddParameter}
							disabled={!newParameter.name.trim()}
							className="bg-white-800 text-black-900 h-[42px] w-[42px] rounded-[8px] flex items-center justify-center disabled:opacity-50"
						>
							<PlusIcon className="size-[18px]" />
						</button>
					</div>
				</div>
			</div>

			<button
				type="button"
				className="h-[38px] rounded-[8px] bg-white-800 text-[14px] cursor-pointer text-black-800 font-[700] px-[16px] font-accent disabled:opacity-50 mt-[8px]"
				onClick={handleSubmit}
				disabled={isPending || parameters.length === 0}
			>
				{isPending ? (
					<div className="flex items-center justify-center gap-[8px]">
						<SpinnerIcon className="animate-follow-through-overlap-spin size-[18px]" />
						Configuring...
					</div>
				) : (
					"Save Configuration"
				)}
			</button>
		</div>
	);
}
