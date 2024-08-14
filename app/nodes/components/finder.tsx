import type { Node } from "@/app/agents/blueprints";
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
import { type FC, Suspense } from "react";
import { AgentList, LoadingAgentList } from "./agent-list";

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
								<div>
									<p>hello</p>
									<AgentList position={position} onSelect={onSelect} />
								</div>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE TEST NODE</DropdownMenuLabel>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeFactory.createNode("onRequest", {
								position,
							});
							onSelect(node);
						}}
					>
						On Request
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeFactory.createNode("response", {
								position,
							});
							onSelect(node);
						}}
					>
						Response
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeFactory.createNode("text", {
								position,
								data: {
									content: "",
								},
							});
							onSelect(node);
						}}
					>
						Text
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => {
							const node = nodeFactory.createNode("textGeneration", {
								position,
							});
							onSelect(node);
						}}
					>
						Text Generation
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
