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
import { nodeFactory } from "..";

type AgentListProps = {
	position: { x: number; y: number };
	onSelect: (node: Node) => void;
};
export const LoadingAgentList: FC = () => {
	return (
		<Command>
			<CommandLoading>Loading...</CommandLoading>
		</Command>
	);
};
export const AgentList: FC<AgentListProps> = async ({ onSelect, position }) => {
	const availableAgents = await getAvailableAgents();
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
								const node = nodeFactory.createNode("agent", {
									position,
									data: {
										relevantAgent: availableAgent,
									},
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
