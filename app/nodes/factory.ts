import type { Node } from "@/app/agents/blueprints";
import { createTemporaryId } from "@/lib/create-temporary-id";
import type { InferInput, ObjectSchema } from "valibot";
import {
	type DefaultPort,
	DefaultPortType,
	type DefaultPorts,
	type NodeClass,
	type NodeClasses,
} from "./type";

type InferSchema<T> = T extends { dataSchema?: infer U }
	? U extends undefined
		? unknown
		: U extends ObjectSchema<infer E, infer M>
			? ObjectSchema<E, M>
			: unknown
	: unknown;

type Position = {
	x: number;
	y: number;
};
type BaseNodeData = DefaultPorts<
	DefaultPort<DefaultPortType, string>[],
	DefaultPort<DefaultPortType, string>[]
> & {
	position: Position;
};
type CreateNodeData<TData> = TData extends ObjectSchema<infer E, infer M>
	? BaseNodeData & { data: InferInput<ObjectSchema<E, M>> }
	: BaseNodeData & { data?: never };

type Factory<TNodeClasses extends NodeClasses> = {
	createNode: <Key extends keyof TNodeClasses>(
		name: Key,
		data: CreateNodeData<InferSchema<TNodeClasses[Key]>>,
	) => Node;
	renderPanel: <Key extends keyof TNodeClasses>(
		name: Key,
	) => TNodeClasses[Key]["panel"];
	$inferClassNames: keyof TNodeClasses;
};

export function factory<TNodeClasses extends NodeClasses>(
	nodeClasses: TNodeClasses,
): Factory<TNodeClasses> {
	return {
		createNode: <Key extends keyof TNodeClasses>(
			name: Key,
			data: CreateNodeData<InferSchema<TNodeClasses[Key]>>,
		): Node => {
			const nodeClass = nodeClasses[name];
			const inputPorts = [
				...(nodeClass.defaultPorts.inputPorts ?? []),
				...(data.inputPorts ?? []),
			];
			const outputPorts = [
				...(nodeClass.defaultPorts.outputPorts ?? []),
				...(data.outputPorts ?? []),
			];
			const id = createTemporaryId();
			return {
				id,
				isCreating: true,
				position: data.position,
				className: name as string,
				inputPorts: inputPorts.map(({ type, name }, index) => ({
					id: createTemporaryId(),
					nodeId: id,
					type: type === DefaultPortType.Execution ? "execution" : "data",
					name,
					direction: "input",
					order: index,
					portsBlueprintsId: createTemporaryId(),
				})),
				outputPorts: outputPorts.map(({ type, name }, index) => ({
					id: createTemporaryId(),
					nodeId: id,
					type: type === DefaultPortType.Execution ? "execution" : "data",
					name,
					direction: "output",
					order: index,
					portsBlueprintsId: createTemporaryId(),
				})),
				data: data.data,
			};
		},
		renderPanel: (name) => {
			return nodeClasses[name].panel;
		},
		$inferClassNames: "" as keyof TNodeClasses,
	};
}
