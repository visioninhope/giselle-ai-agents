import type { NodeClass } from "@/app/nodes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FC } from "react";
import { nodeClasses } from "../classes";

type FinderProps = {
	onSelect: (nodeClass: NodeClass) => void;
};
export const Finder: FC<FinderProps> = ({ onSelect }) => {
	const handleSelect = (nodeClass: NodeClass) => () => {
		onSelect(nodeClass);
	};
	return (
		<DropdownMenu defaultOpen={true} modal={false}>
			<DropdownMenuTrigger />
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<DropdownMenuLabel>CREATE TEST NODE</DropdownMenuLabel>
					{nodeClasses.map((nodeClass) => (
						<DropdownMenuItem
							key={nodeClass.name}
							onSelect={handleSelect(nodeClass)}
						>
							{nodeClass.name}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
