import { type FC, useCallback, useState } from "react";
import { createNodeStructure } from "./strcture";

const loopNodeStructure = createNodeStructure({
	key: "Loop",
	kind: "action",
	name: "Loop",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "iterationObject",
			kind: "data",
			dataType: "string",
			array: true,
			label: "Array",
		},
	],
	outputs: [
		{ key: "loopBody", kind: "execution", label: "Loop Body" },
		{
			key: "arrayItem",
			kind: "data",
			dataType: "elementOfInputData",
			label: "Array Item",
			inputPinKey: "iterationObject",
		},
		{ key: "completed", kind: "execution", label: "Completed" },
	],
});

const contextNodeStructure = createNodeStructure({
	key: "Context",
	kind: "context",
	name: "Read Context",
	outputs: [
		{
			key: "context",
			kind: "data",
			dataType: (dataType) => dataType,
			label: (label) => label,
		},
	],
});

const createDocumentNodeStructure = createNodeStructure({
	key: "CreateDocument",
	kind: "action",
	name: "Create Document",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "input",
			kind: "data",
			dataType: "string",
		},
	],
	outputs: [
		{ key: "execTo", kind: "execution" },
		{
			key: "document",
			kind: "data",
			dataType: "string",
			label: "Document",
		},
	],
});

const appendValueToContextNodeStructure = createNodeStructure({
	key: "AppendValueToContext",
	kind: "action",
	name: (name = "Context") => `Append Value To ${name}`,
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
		{
			key: "value",
			kind: "data",
			dataType: "string",
			label: "Value",
		},
	],
	outputs: [{ key: "execTo", kind: "execution" }],
});

const textGenerationNodeStructure = createNodeStructure({
	key: "TextGeneration",
	kind: "action",
	name: "Text Generation",
	inputs: [
		{
			key: "execFrom",
			kind: "execution",
		},
	],
	outputs: [
		{ key: "execTo", kind: "execution" },
		{
			key: "text",
			kind: "data",
			dataType: "string",
			label: "Return value",
		},
	],
});

export const nodeStructures = [
	loopNodeStructure,
	contextNodeStructure,
	createDocumentNodeStructure,
	appendValueToContextNodeStructure,
	textGenerationNodeStructure,
];
export type NodeStructures = typeof nodeStructures;
export type NodeStructureKey = NodeStructures[number]["key"];

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

export type OnNodeSelect = (key: NodeStructureKey) => void;
type NodeSelectCommandProps = {
	onSelect: (key: NodeStructureKey) => void;
};
export const NodeSelectCommand: FC<NodeSelectCommandProps> = ({ onSelect }) => {
	const [state, setState] = useState(false);
	const handleSelect = useCallback(
		(key: string) => {
			setState(true);
			// onSelect(key as NodeStructureKey);
		},
		[setState],
	);
	if (!state) {
		return (
			<Command className="rounded-lg border shadow-md">
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Actions">
						{nodeStructures.map(({ key, name }) => (
							<CommandItem key={key} value={key} onSelect={handleSelect}>
								<span>{typeof name === "string" ? name : name()}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</Command>
		);
	}
	return (
		<Command className="rounded-lg border shadow-md">
			<CommandInput placeholder="O" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Context">
					{nodeStructures.map(({ key, name }) => (
						<CommandItem key={key} value={key} onSelect={handleSelect}>
							<span>{typeof name === "string" ? name : name()}</span>
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
};
