import type { Node } from "@/app/agents/blueprints";
import { nodeService } from "@/app/nodes";
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
import { type FC, Suspense } from "react";
import { AgentList } from "./agent-list";
import { KnowledgeList } from "./knowledge-list";

type FinderProps = {
	position: { x: number; y: number };
	onSelect: (node: Node) => void;
};
export const Finder: FC<FinderProps> = ({ position, onSelect }) => {
	return (
		<DropdownMenu defaultOpen={true} modal={false}>
			<DropdownMenuTrigger />
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Agent</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<AgentList position={position} onSelect={onSelect} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE TEST NODE</DropdownMenuLabel>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeService.createNode("onRequest", {
								position,
							});
							onSelect(node);
						}}
					>
						On Request
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeService.createNode("response", {
								position,
							});
							onSelect(node);
						}}
					>
						Response
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeService.createNode("text", {
								position,
								data: {
									template: "",
								},
							});
							onSelect(node);
						}}
					>
						Text
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeService.createNode("textGeneration", {
								position,
							});
							onSelect(node);
						}}
					>
						Text Generation
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Knowledge Retrieval</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<KnowledgeList position={position} onSelect={onSelect} />
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
