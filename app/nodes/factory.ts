import { createTemporaryId } from "@/lib/create-temporary-id";
import type { InferInput, ObjectSchema } from "valibot";
import type { Node } from "../agents/blueprints";
import { agent } from "./classes/agent";
import { onRequest } from "./classes/on-request";
import {
	type DefaultPort,
	DefaultPortType,
	type DefaultPorts,
	type NodeClass,
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

function factory<
	TNodeClasses extends Record<
		string,
		NodeClass<
			any,
			any,
			DefaultPorts<
				DefaultPort<DefaultPortType, string>[],
				DefaultPort<DefaultPortType, string>[]
			>,
			any
		>
	>,
>(nodeClasses: TNodeClasses) {
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
		classList: (): [keyof TNodeClasses, NodeClass<any, any, any, any>][] =>
			Object.entries(nodeClasses),
		$inferClassKeys: "" as keyof TNodeClasses,
	};
}

export const nodeFactory = factory({ onRequest, agent });
