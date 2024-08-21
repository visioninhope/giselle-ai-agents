import { type AvailableAgent, getAvailableAgents } from "@/app/agents";
import { type Node, useBlueprint } from "@/app/agents/blueprints";
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

type KnowledgeListProps = {
	position: { x: number; y: number };
	onSelect: (node: Node) => void;
};
export const KnowledgeList: FC<KnowledgeListProps> = ({
	position,
	onSelect,
}) => {
	const { blueprint } = useBlueprint();
	return (
		<Command>
			<CommandInput
				placeholder="Filter knowledge..."
				autoFocus={true}
				className="h-9"
			/>
			<CommandList>
				<CommandEmpty>
					<p>
						No knowledge found. <br />
						Please create a knowledge first.
					</p>
				</CommandEmpty>
				<CommandGroup>
					{blueprint.knowledges.map((knowledge) => (
						<CommandItem
							key={knowledge.id}
							onSelect={() => {
								const node = nodeService.createNode("knowledgeRetrieval", {
									position,
									data: {
										knowledgeIds: [knowledge.id],
										openaiAssistantId: "",
									},
								});
								onSelect(node);
							}}
						>
							{knowledge.name}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
};
