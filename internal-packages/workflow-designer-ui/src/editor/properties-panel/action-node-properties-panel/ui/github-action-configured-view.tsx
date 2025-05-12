import type {
	GitHubActionCommandCofiguredState,
	Input,
	NodeId,
} from "@giselle-sdk/data-type";
import { githubActionIdToLabel, githubActions } from "@giselle-sdk/flow";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { useMemo } from "react";
import useSWR from "swr";
import { NodeIcon } from "../../../../icons/node";
import { defaultName } from "../../../../utils";
import { GitHubRepositoryBlock } from "../../ui";
import type { InputWithConnectedOutput } from "../lib";

export function GitHubActionConfiguredView({
	nodeId,
	inputs,
	state,
}: {
	nodeId: NodeId;
	inputs: Input[];
	state: GitHubActionCommandCofiguredState;
}) {
	const client = useGiselleEngine();
	const { isLoading, data } = useSWR(
		{
			installationId: state.installationId,
			repositoryNodeId: state.repositoryNodeId,
		},
		({ installationId, repositoryNodeId }) =>
			client.getGitHubRepositoryFullname({
				installationId,
				repositoryNodeId,
			}),
	);

	const action = useMemo(
		() =>
			githubActions.find(
				(githubAction) => githubAction.command.id === state.commandId,
			),
		[state.commandId],
	);

	if (action === undefined) {
		throw new Error(`Action with id ${state.commandId} not found`);
	}

	const { data: workflow } = useWorkflowDesigner();
	const parameters = useMemo(() => {
		const tmp: InputWithConnectedOutput[] = [];
		const connectionsToThisNode = workflow.connections.filter(
			(connection) => connection.inputNode.id === nodeId,
		);
		for (const input of inputs) {
			const connectedConnection = connectionsToThisNode.find(
				(connection) => connection.inputId === input.id,
			);
			const connectedNode = workflow.nodes.find(
				(node) => node.id === connectedConnection?.outputNode.id,
			);
			const connectedOutput = connectedNode?.outputs.find(
				(output) => output.id === connectedConnection?.outputId,
			);
			if (connectedNode === undefined || connectedOutput === undefined) {
				tmp.push(input);
				continue;
			}
			tmp.push({
				...input,
				connectedOutput: {
					...connectedOutput,
					node: connectedNode,
				},
			});
		}
		return tmp;
	}, [inputs, nodeId, workflow]);

	return (
		<div className="flex flex-col gap-[17px] p-0">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Repository</p>
				<div className="px-[12px] pt-[6px]">
					{isLoading || data === undefined ? (
						<p>loading...</p>
					) : (
						<GitHubRepositoryBlock
							owner={data.fullname.owner}
							repo={data.fullname.repo}
						/>
					)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Event Type</p>
				<div className="px-[16px] py-[9px] w-full bg-transparent text-[14px]">
					{githubActionIdToLabel(state.commandId)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Parameter</p>
				<div className="px-[16px] py-[9px] w-full bg-transparent text-[14px]">
					<ul className="w-full border-collapse divide-y divide-black-400">
						{parameters.map((parameter) => (
							<li
								key={parameter.id}
								className="py-[12px] flex items-center justify-between"
							>
								<div className="flex items-center gap-[4px]">
									<p className="text-[16px]">{parameter.label}</p>
									{parameter.isRequired ? (
										<span
											className={clsx(
												"px-2 py-0.5 rounded text-[12px]",
												parameter.connectedOutput === undefined
													? "bg-red-950/30 text-red-400 border border-red-500/30"
													: "bg-slate-800 text-slate-300",
											)}
										>
											Required
										</span>
									) : (
										<span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400">
											Optional
										</span>
									)}
								</div>
								{parameter.connectedOutput ? (
									<div className="flex items-center border border-black-400 px-[12px] py-[8px] rounded-[4px] gap-[4px]">
										<NodeIcon
											node={parameter.connectedOutput.node}
											className="size-[14px]"
										/>
										<span>{defaultName(parameter.connectedOutput.node)}</span>
										<span>/</span>
										<span>{parameter.connectedOutput.label}</span>
									</div>
								) : (
									<div>TODO: Select Output Popover</div>
								)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
