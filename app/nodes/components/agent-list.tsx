import {
	type AvailableAgentWithInputPort,
	getAvailableAgentsWithInputPorts,
} from "@/app/agents";
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
import { type AgentNodeClass, agent as agentNodeClass } from "../";

type AgentListProps = {
	onSelect: (nodeClass: AgentNodeClass) => void;
};
export const AgentList: FC<AgentListProps> = ({ onSelect }) => {
	const [loading, setLoading] = useState(true);
	const [availableAgents, setAvaialbleAgents] = useState<
		AvailableAgentWithInputPort[]
	>([]);
	const fetchAgents = useCallback(async () => {
		setAvaialbleAgents(await getAvailableAgentsWithInputPorts());
		setLoading(false);
	}, []);
	useEffect(() => {
		fetchAgents();
	}, [fetchAgents]);

	const handleSelect = useCallback(
		(agent: AvailableAgentWithInputPort) => () => {
			onSelect({
				...agentNodeClass,
				template: {
					...agentNodeClass.template,
					inputPorts: [
						...(agentNodeClass.template.inputPorts ?? []),
						...agent.inputPorts,
					],
					properties: [
						...(agentNodeClass.template.properties ?? []),
						{
							name: "relevantAgentId",
							value: `${agent.id}`,
						},
						{
							name: "relevantAgentName",
							value: agent.name ?? "",
						},
						{
							name: "relevantAgentBlueprintId",
							value: `${agent.blueprintId}`,
						},
					],
				},
				data: {},
			});
		},
		[onSelect],
	);
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
							value={`${availableAgent.id}`}
							onSelect={handleSelect(availableAgent)}
						>
							{availableAgent.name}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
};
