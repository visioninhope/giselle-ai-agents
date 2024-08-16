import type { Node } from "@/app/agents/blueprints";
import { createTemporaryId } from "@/lib/create-temporary-id";
import type { JSX } from "react";
import invariant from "tiny-invariant";
import type { InferInput, ObjectSchema } from "valibot";
import {
	type DefaultPort,
	DefaultPortType,
	type DefaultPorts,
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

type NodeService<TNodeClasses extends NodeClasses> = {
	createNode: <ClassName extends keyof TNodeClasses>(
		name: ClassName,
		data: CreateNodeData<InferSchema<TNodeClasses[ClassName]>>,
	) => Node;
	renderPanel: <ClassName extends keyof TNodeClasses>(
		name: ClassName,
		{ node }: { node: Node },
	) => JSX.Element | null;
	$inferClassNames: keyof TNodeClasses;
	runAction: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
		{ node, requestId }: { node: Node; requestId: number },
	) => Promise<void>;
	runResolver: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
		{ node, requestId }: { node: Node; requestId: number },
	) => Promise<void>;
};

export function createNodeService<TNodeClasses extends NodeClasses>(
	nodeClasses: TNodeClasses,
): NodeService<TNodeClasses> {
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
		renderPanel: (name, { node }) => {
			const nodeClass = nodeClasses[name];
			const renderPanel = nodeClass.renderPanel;
			if (renderPanel == null) {
				return null;
			}
			return renderPanel({ node, dataSchema: nodeClass.dataSchema });
		},
		runAction: async (name, { node, requestId }) => {
			const nodeClass = nodeClasses[name];
			const action = nodeClass.action;
			if (action == null) {
				return;
			}
			await action({
				requestId,
				node,
				dataSchema: nodeClass.dataSchema,
				findDefaultInputPortAsBlueprint: (name) => {
					const port = node.inputPorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
				findDefaultOutputPortAsBlueprint: (name) => {
					const port = node.outputPorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
			});
		},
		runResolver: async (name, { node, requestId }) => {
			const nodeClass = nodeClasses[name];
			const resolver = nodeClass.resolver;
			if (resolver == null) {
				console.log("Resolver not found");
				return;
			}
			await resolver({
				requestId,
				node,
				dataSchema: nodeClass.dataSchema,
				findDefaultInputPortAsBlueprint: (name) => {
					const port = node.inputPorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
				findDefaultOutputPortAsBlueprint: (name) => {
					const port = node.outputPorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
			});
		},
		$inferClassNames: "" as keyof TNodeClasses,
	};
}
