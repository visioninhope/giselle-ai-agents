import type { NodeType } from "@/app/node-defs";
import type { GET } from "@/app/node-defs/use-node-defs/route";
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
import type { InferResponse } from "@/lib/api";
import { WorkflowIcon } from "lucide-react";
import { type FC, useCallback } from "react";

type EditorDropdownMenuProps = {
	nodeDefs: InferResponse<typeof GET>["nodeDefs"];
	onSelect: (key: NodeType) => void;
};
export const EditorDropdownMenu: FC<EditorDropdownMenuProps> = ({
	nodeDefs,
	onSelect,
}) => {
	const handleNodeSelect = useCallback(
		(key: NodeType) => () => {
			onSelect(key);
		},
		[onSelect],
	);
	return (
		<DropdownMenu defaultOpen={true} modal={false}>
			<DropdownMenuTrigger />
			<DropdownMenuContent>
				{/* <DropdownMenuGroup>
					<DropdownMenuLabel>CREATE BASIC NODE</DropdownMenuLabel>
					<DropdownMenuItem onSelect={() => handleNodeSelect("TextGeneration")}>
						<div className="flex items-center gap-2">
							<WorkflowIcon className="w-6 h-6" />
							<div>AI Agent</div>
						</div>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE ADVANCED NODE</DropdownMenuLabel>
					<DropdownMenuItem onSelect={() => handleNodeSelect("Loop")}>
						Loop
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => handleNodeSelect("CreateDocument")}>
						Create Document
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Read Context</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								{contexts.map(({ key, name }) => (
									<DropdownMenuItem
										key={key}
										onSelect={() =>
											handleNodeSelect("Context", {
												label: name,
											})
										}
									>
										{name}
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							Set Valut to Context
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								{contexts.map(({ key, name }) => (
									<DropdownMenuItem
										key={key}
										onSelect={() =>
											handleNodeSelect("AppendValueToContext", {
												label: name,
											})
										}
									>
										{name}
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator /> */}
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE TEST NODE</DropdownMenuLabel>
					{nodeDefs.map((nodeDef) => (
						<DropdownMenuItem
							key={nodeDef.key}
							onSelect={handleNodeSelect(nodeDef.key)}
						>
							{nodeDef.label}
						</DropdownMenuItem>
					))}
					{/* <DropdownMenuItem onSelect={() => handleNodeSelect("FindUser")}>
						Find User
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => handleNodeSelect("SendMail")}>
						Send Mail
					</DropdownMenuItem> */}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
