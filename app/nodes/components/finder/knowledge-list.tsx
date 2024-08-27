import { type Node, useBlueprint } from "@/app/agents/blueprints";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import type { FC } from "react";
import { type NodeGraph, nodeService } from "../..";

type KnowledgeListProps = {
	onSelect: (node: NodeGraph) => void;
};
export const KnowledgeList: FC<KnowledgeListProps> = ({ onSelect }) => {
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
