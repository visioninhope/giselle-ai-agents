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
import type { FC } from "react";
import { addNode, useBlueprint } from "../../blueprints";
// import { AgentList } from "./agent-list";

type FinderProps = {
	position: { x: number; y: number };
};
export const Finder: FC<FinderProps> = ({ position }) => {
	const { mutate, blueprint } = useBlueprint();
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
							mutate({
								type: "addNode",
								optimisticData: { node },
								action: () => addNode({ blueprintId: blueprint.id, node }),
							});
						}}
					>
						On Request
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
