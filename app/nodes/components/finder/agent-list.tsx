import { type AvailableAgent, getAvailableAgents } from "@/app/agents";
import type { Node } from "@/app/agents/blueprints";
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
import { nodeService } from "../..";
import { buildDefaultPort } from "../../builder";
import { DefaultPortType } from "../../type";

type AgentListProps = {
	position: { x: number; y: number };
	onSelect: (node: Node) => void;
};
export const AgentList: FC<AgentListProps> = ({ onSelect, position }) => {
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
									position,
									data: {
										relevantAgent: {
											id: availableAgent.id,
											name: availableAgent.name,
											blueprintId: availableAgent.blueprintId,
										},
									},
									inputPorts: availableAgent.inputPorts.map((port) =>
										buildDefaultPort({
											type: DefaultPortType.Data,
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
