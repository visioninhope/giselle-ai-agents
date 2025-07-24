import { Button } from "@giselle-internal/ui/button";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import {
	ManualTriggerParameter,
	ManualTriggerParameterId,
	type Output,
	OutputId,
	type TriggerNode,
} from "@giselle-sdk/data-type";
import {
	useFeatureFlag,
	useFlowTrigger,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle/react";
import { CheckIcon, ChevronDownIcon, TrashIcon } from "lucide-react";
import {
	type FormEventHandler,
	useCallback,
	useState,
	useTransition,
} from "react";
import { SpinnerIcon } from "../../../../../icons";
import { ManualTriggerConfiguredView } from "../../ui";

const TYPE_OPTIONS = [
	{ id: "text", name: "Text" },
	{ id: "number", name: "Number" },
	{ id: "boolean", name: "Boolean" },
	{ id: "json", name: "JSON" },
];

export function ManualTriggerPropertiesPanel({ node }: { node: TriggerNode }) {
	const { data: workspace, updateNodeData } = useWorkflowDesigner();
	const client = useGiselleEngine();
	const [isPending, startTransition] = useTransition();
	const [parameters, setParameters] = useState<ManualTriggerParameter[]>([]);
	const [staged] = useState(false);
	const [selectedType, setSelectedType] = useState<string>("text");
	const { experimental_storage } = useFeatureFlag();
	const { callbacks } = useFlowTrigger();

	const handleAddParameter = useCallback<FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const name = formData.get("name") as string;
			const required = formData.get("required") !== null;

			const parse = ManualTriggerParameter.safeParse({
				id: ManualTriggerParameterId.generate(),
				name,
				type: selectedType,
				required,
			});
			if (!parse.success) {
				/** @todo error handling */
				return;
			}
			setParameters((prev) => [...prev, parse.data]);
			e.currentTarget.reset();
			setSelectedType("text");
		},
		[selectedType],
	);

	const handleRemoveParameter = useCallback((id: string) => {
		setParameters((prev) => prev.filter((param) => param.id !== id));
	}, []);

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			if (parameters.length === 0) {
				/** @todo error handling */
				return;
			}

			const outputs: Output[] = parameters.map((param) => ({
				id: OutputId.generate(),
				label: param.name,
				accessor: param.id,
			}));

			startTransition(async () => {
				const { triggerId } = await client.configureTrigger({
					trigger: {
						nodeId: node.id,
						workspaceId: workspace?.id,
						enable: true,
						configuration: {
							provider: "manual",
							event: {
								id: "manual",
								parameters,
							},
							staged,
						},
					},
					useExperimentalStorage: experimental_storage,
				});

				await callbacks?.flowTriggerUpdate?.({
					id: triggerId,
					nodeId: node.id,
					workspaceId: workspace?.id,
					enable: true,
					configuration: {
						provider: "manual",
						event: {
							id: "manual",
							parameters,
						},
						staged,
					},
				});

				updateNodeData(node, {
					content: {
						...node.content,
						state: {
							status: "configured",
							flowTriggerId: triggerId,
						},
					},
					outputs,
					name: node.name,
				});
			});
		},
		[
			parameters,
			staged,
			client,
			node,
			workspace?.id,
			updateNodeData,
			callbacks?.flowTriggerUpdate,
			experimental_storage,
		],
	);

	if (node.content.state.status === "configured") {
		return <ManualTriggerConfiguredView node={node} />;
	}

	return (
		<div className="flex flex-col gap-[8px] h-full px-1">
			<div className="overflow-y-auto flex-1 pr-2 custom-scrollbar h-full relative">
				<div className="space-y-[4px]">
					<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">
						Output Parameter
					</p>
					<div className="px-[4px] py-0 w-full bg-transparent text-[14px]">
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
							<div className="text-[14px] text-white-400 mb-[16px]">
								No parameters configured yet. Add at least one parameter.
							</div>
						)}
					</div>
				</div>

				<div className="space-y-[4px] mt-[16px]">
					<div className="flex flex-col gap-[8px] rounded-[8px]">
						<form
							className="flex gap-[8px] items-end"
							onSubmit={handleAddParameter}
						>
							<div className="flex-1">
								<label
									htmlFor="param-name"
									className="text-[12px] text-black-500 mb-[4px] block"
								>
									Parameter Name
								</label>
								<input
									id="param-name"
									name="name"
									type="text"
									placeholder="Write the parameter name"
									className="w-full flex justify-between items-center rounded-[8px] py-[8px] px-[12px] outline-none focus:outline-none border-[1px] border-white-900 text-[14px]"
									data-1p-ignore
								/>
							</div>
							<div className="w-[100px]">
								<label
									htmlFor="param-type"
									className="text-[12px] text-black-500 mb-[4px] block leading-[16px]"
								>
									Type
								</label>
								<DropdownMenu
									trigger={
										<button
											type="button"
											className="w-full px-3 py-2 bg-black-300/20 rounded-[8px] text-white-400 text-[14px] font-geist cursor-pointer text-left flex items-center justify-between"
										>
											<span className="text-[#F7F9FD]">
												{TYPE_OPTIONS.find((opt) => opt.id === selectedType)
													?.name || "Text"}
											</span>
											<ChevronDownIcon className="h-4 w-4 text-white/60" />
										</button>
									}
									items={TYPE_OPTIONS}
									renderItem={(option) => (
										<>
											<span>{option.name}</span>
											{selectedType === option.id && (
												<CheckIcon className="h-4 w-4" />
											)}
										</>
									)}
									onSelect={(_event, option) => setSelectedType(option.id)}
									align="start"
									sideOffset={4}
								/>
							</div>
							<div className="w-auto">
								<label
									htmlFor="param-required"
									className="text-[12px] text-black-500 mb-[4px] block leading-[16px]"
								>
									Required
								</label>
								<div className="flex items-center justify-center h-[37px]">
									<input id="param-required" type="checkbox" name="required" />
								</div>
							</div>
							<Button type="submit" variant="filled" size="large">
								Add
							</Button>
						</form>
					</div>
				</div>

				<div className="pt-[8px] flex gap-[8px] mt-[12px] px-[4px]">
					<form onSubmit={handleSubmit} className="w-full">
						<Button
							type="submit"
							variant="solid"
							size="large"
							disabled={isPending}
							leftIcon={
								isPending && (
									<SpinnerIcon className="animate-follow-through-overlap-spin size-[18px]" />
								)
							}
						>
							<span>{isPending ? "Setting up..." : "Save Configuration"}</span>
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
