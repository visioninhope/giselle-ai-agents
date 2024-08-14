import { nodeFactory } from "@/app/nodes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createTemporaryId } from "@/lib/create-temporary-id";
import { type FC, useCallback } from "react";
import { type Node, addNode, useBlueprint } from "../../blueprints";
// import { AgentList } from "./agent-list";

type FinderProps = {
	position: { x: number; y: number };
};
export const Finder: FC<FinderProps> = ({ position }) => {
	const { mutate, blueprint } = useBlueprint();
	const addNodeMutation = useCallback(
		(node: Node) => {
			mutate({
				type: "addNode",
				optimisticData: { node },
				action: () => addNode({ blueprintId: blueprint.id, node }),
			});
		},
		[mutate, blueprint.id],
	);
	return (
		<DropdownMenu defaultOpen={true} modal={false}>
			<DropdownMenuTrigger />
			<DropdownMenuContent>
				{/**<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Agent</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<AgentList onSelect={onSelect} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					</DropdownMenuGroup>
				<DropdownMenuSeparator /> **/}
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE TEST NODE</DropdownMenuLabel>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeFactory.createNode("onRequest", {
								position,
							});
							addNodeMutation(node);
						}}
					>
						On Request
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeFactory.createNode("response", {
								position,
							});
							addNodeMutation(node);
						}}
					>
						Response
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
