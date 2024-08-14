import type { Node } from "@/app/agents/blueprints";
import { createTemporaryId } from "@/lib/create-temporary-id";
import type { InferInput, ObjectSchema } from "valibot";
import type { Step } from "../agents/requests";
import {
	type Action,
	type DefaultPort,
	DefaultPortType,
	type DefaultPorts,
	type NodeClasses,
	type Resolver,
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
	createNode: <ClassName extends keyof TNodeClasses>(
		name: ClassName,
		data: CreateNodeData<InferSchema<TNodeClasses[ClassName]>>,
	) => Node;
	renderPanel: <ClassName extends keyof TNodeClasses>(
		name: ClassName,
	) => TNodeClasses[ClassName]["panel"];
	getAction: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
	) => Action | undefined | null;
	getResolver: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
	) => Resolver | undefined | null;
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
		getAction: (name) => {
			return nodeClasses[name].action;
		},
		getResolver: (name) => {
			return nodeClasses[name].resolver;
		},
		$inferClassNames: "" as keyof TNodeClasses,
	};
}
