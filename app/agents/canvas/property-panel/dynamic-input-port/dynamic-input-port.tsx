import {
	type BlueprintPort,
	type Node,
	addNodePort,
	useBlueprint,
} from "@/app/agents/blueprints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { createId } from "@paralleldrive/cuid2";
import { PlusIcon } from "lucide-react";
import { type FC, type FormEventHandler, useCallback, useState } from "react";
import { DynamicInputPortListItem } from "./dynamic-input-port-list-item";

type DynamicInputPortProps = {
	node: Node;
};
export const DynamicInputPort: FC<DynamicInputPortProps> = ({ node }) => {
	const { blueprint, mutate } = useBlueprint();
	const [disclosure, setDisclosure] = useState(false);
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(formEvent) => {
			formEvent.preventDefault();
			setDisclosure(false);
			const formData = new FormData(formEvent.currentTarget);
			const draftPort: BlueprintPort = {
				id: createId(),
				nodeId: node.id,
				name: formData.get("name") as string,
				type: "data",
				direction: "input",
				order: 1000 /** @todo  last port order +1  */,
				portsBlueprintsId: 0,
				nodeClassKey: null,
			};
			mutate({
				type: "addNodePort",
				optimisticData: {
					port: draftPort,
				},
				action: () =>
					addNodePort({
						blueprintId: blueprint.id,
						port: {
							nodeId: Number.parseInt(node.id, 10),
							name: draftPort.name,
							direction: "input",
						},
					}).then((result) => ({
						port: { ...draftPort, id: `${result.port.id}` },
					})),
			});
		},
		[mutate, blueprint.id, node.id],
	);
	return (
		<div>
			<div className="flex justify-between mb-2 px-4">
				<h3 className="text-sm font-bold">Input Parameters</h3>
				<div>
					<Popover open={disclosure} onOpenChange={setDisclosure}>
						<PopoverTrigger asChild>
							<Button size="icon" variant="ghost">
								<PlusIcon className="w-4 h-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end">
							<form onSubmit={handleSubmit}>
								<div className="flex flex-col gap-4">
									<Input placeholder="Parameter" name="name" />
									<div className="flex justify-end">
										<Button type="submit">Create parameter</Button>
									</div>
								</div>
							</form>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				{node.inputPorts
					.filter(({ type }) => type === "data")
					.map((port) => (
						<DynamicInputPortListItem key={port.id} port={port} />
					))}
			</div>
		</div>
	);
};
