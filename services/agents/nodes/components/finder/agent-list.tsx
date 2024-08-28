import { type AvailableAgent, getAvailableAgents } from "@/app/agents";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import { type FC, useCallback, useEffect, useState } from "react";
import { type NodeGraph, nodeService } from "../..";
import { buildDefaultPort } from "../../builder";
import { portType } from "../../type";

type AgentListProps = {
	onSelect: (node: NodeGraph) => void;
};
export const AgentList: FC<AgentListProps> = ({ onSelect }) => {
	const [loading, setLoading] = useState(true);
	const [availableAgents, setAvaialbleAgents] = useState<AvailableAgent[]>([]);
	const fetchAgents = useCallback(async () => {
		setAvaialbleAgents(await getAvailableAgents());
		setLoading(false);
	}, []);
	useEffect(() => {
		fetchAgents();
	}, [fetchAgents]);

	if (loading) {
		return (
			<Command>
				<CommandLoading>Loading...</CommandLoading>
			</Command>
		);
	}
	return (
		<Command>
			<CommandInput
				placeholder="Filter agent..."
				autoFocus={true}
				className="h-9"
			/>
			<CommandList>
				<CommandEmpty>No agent found.</CommandEmpty>
				<CommandGroup>
					{availableAgents.map((availableAgent) => (
						<CommandItem
							key={availableAgent.id}
							onSelect={() => {
								const node = nodeService.createNode("agent", {
									data: {
										relevantAgent: {
											id: availableAgent.id,
											name: availableAgent.name,
											blueprintId: availableAgent.blueprintId,
										},
									},
									inputPorts: availableAgent.inputPorts.map((port) =>
										buildDefaultPort({
											type: portType.data,
											name: port.name,
										}),
									),
								});
								onSelect(node);
							}}
						>
							{availableAgent.name}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
};
