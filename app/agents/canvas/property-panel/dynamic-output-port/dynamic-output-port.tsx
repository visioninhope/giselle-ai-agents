import {
	type Node,
	useBlueprint,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon } from "lucide-react";
import { type FC, useCallback, useState } from "react";
import { DynamicOutputPortListItem } from "./dynamic-output-port-list-item";

type DynamicOutputPortProps = {
	node: Node;
};
export const DynamicOutputPort: FC<DynamicOutputPortProps> = ({ node }) => {
	const blueprint = useBlueprint();
	// const { addNodePort } = useAddNodePortAction();
	const heading = node.className === "onRequest" ? "Parameters" : "Output Port";
	const [disclosure, setDisclosure] = useState(false);
	const [value, setValue] = useState("");
	// const handleOpenChange = useCallback(() => {
	// 	addNodePort({
	// 		port: {
	// 			nodeId: node.id,
	// 			direction: "output",
	// 			name: value,
	// 		},
	// 	});
	// 	setDisclosure(false);
	// 	setValue("");
	// }, [addNodePort, node, value]);
	return (
		<div>
			<div className="flex justify-between mb-2 px-4">
				<h3 className="text-sm font-bold">{heading}</h3>
				<div>
					<Popover open={disclosure} onOpenChange={setDisclosure}>
						<PopoverTrigger asChild>
							<Button size="icon" variant="ghost">
								<PlusIcon className="w-4 h-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<div className="flex flex-col gap-4">
								<Input
									placeholder="Parameter"
									value={value}
									onChange={(e) => {
										setValue(e.target.value);
									}}
								/>
								<div className="flex justify-end">
									<Button type="button" /*onClick={handleOpenChange}*/>
										Create parameter
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				{node.outputPorts
					.filter(({ type }) => type === "data")
					.map((port) => (
						<DynamicOutputPortListItem key={port.id} port={port} />
					))}
			</div>
		</div>
	);
};
