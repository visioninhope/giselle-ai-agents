import type { Knowledge } from "@/services/knowledges";
import { createId } from "@paralleldrive/cuid2";
import type { JSX } from "react";
import invariant from "tiny-invariant";
import { type InferInput, type ObjectSchema, parse } from "valibot";
import type { DefaultPort, DefaultPorts, NodeClasses, NodeGraph } from "./type";

type InferSchema<T> = T extends { dataSchema?: infer U }
	? U extends undefined
		? unknown
		: U extends ObjectSchema<infer E, infer M>
			? ObjectSchema<E, M>
			: unknown
	: unknown;

type CreateNodeData<TData> = TData extends ObjectSchema<infer E, infer M>
	? { data: InferInput<ObjectSchema<E, M>> }
	: { data?: never };
type CreateNodeArgs<TData> = DefaultPorts<
	DefaultPort[],
	DefaultPort[]
> & {} & CreateNodeData<TData>;

type NodeService<TNodeClasses extends NodeClasses> = {
	createNode: <ClassName extends keyof TNodeClasses>(
		name: ClassName,
		args?: CreateNodeArgs<InferSchema<TNodeClasses[ClassName]>>,
	) => NodeGraph;
	renderPanel: <ClassName extends keyof TNodeClasses>(
		name: ClassName,
		{ node }: { node: NodeGraph },
	) => JSX.Element | null;
	$inferClassNames: keyof TNodeClasses;
	runAction: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
		args: { node: NodeGraph; requestId: number; knowledges: Knowledge[] },
	) => Promise<void>;
	runResolver: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
		args: { node: NodeGraph; requestId: number; knowledges: Knowledge[] },
	) => Promise<void>;
	runAfterCreateCallback: <ClassName extends keyof TNodeClasses>(
		className: ClassName,
		args: { node: NodeGraph },
	) => Promise<void>;
};

export function createNodeService<TNodeClasses extends NodeClasses>(
	nodeClasses: TNodeClasses,
): NodeService<TNodeClasses> {
	return {
		createNode: (name, args) => {
			invariant(typeof name === "string", "name must be a string");
			const nodeClass = nodeClasses[name];
			const inputPorts = [
				...(nodeClass.defaultPorts.inputPorts ?? []),
				...(args?.inputPorts ?? []),
			] as DefaultPort[];
			const outputPorts = [
				...(nodeClass.defaultPorts.outputPorts ?? []),
				...(args?.outputPorts ?? []),
			] as DefaultPort[];
			const id = `nd_${createId()}` as const;

			return {
				id,
				className: name,
				name,
				data: args?.data,
				sourcePorts: inputPorts.map(({ type, name }) => ({
					id: `pt_${createId()}` as const,
					nodeId: id,
					type,
					name,
				})),
				targetPorts: outputPorts.map(({ type, name }) => ({
					id: `pt_${createId()}` as const,
					nodeId: id,
					type,
					name,
				})),
			};
		},
		renderPanel: (name, { node }) => {
			const nodeClass = nodeClasses[name];
			const renderPanel = nodeClass.renderPanel;
			if (renderPanel == null) {
				return null;
			}
			const dataSchema = nodeClass.dataSchema;
			const data = dataSchema == null ? {} : parse(dataSchema, node.data);
			return renderPanel({ node, data });
		},
		runAction: async (name, { node, requestId, knowledges }) => {
			const nodeClass = nodeClasses[name];
			const action = nodeClass.action;
			if (action == null) {
				return;
			}
			const dataSchema = nodeClass.dataSchema;
			const data = dataSchema == null ? {} : parse(dataSchema, node.data);
			await action({
				requestId,
				node,
				knowledges,
				data,
				findDefaultInputPortAsBlueprint: (name) => {
					const port = node.sourcePorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
				findDefaultOutputPortAsBlueprint: (name) => {
					const port = node.targetPorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
			});
		},
		runResolver: async (name, { node, requestId, knowledges }) => {
			const nodeClass = nodeClasses[name];
			const resolver = nodeClass.resolver;
			if (resolver == null) {
				console.log("Resolver not found");
				return;
			}
			const dataSchema = nodeClass.dataSchema;
			const data = dataSchema == null ? {} : parse(dataSchema, node.data);
			await resolver({
				requestId,
				node,
				knowledges,
				data,
				findDefaultInputPortAsBlueprint: (name) => {
					const port = node.sourcePorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
				findDefaultOutputPortAsBlueprint: (name) => {
					const port = node.targetPorts.find(
						({ name: portName }) => portName === name,
					);
					invariant(port != null, `Port not found: ${name}`);
					return port;
				},
			});
		},
		runAfterCreateCallback: async (name, { node }) => {
			const nodeClass = nodeClasses[name];
			const afterCreate = nodeClass.afterCreate;
			if (afterCreate == null) {
				console.log("After create not found");
				return;
			}
			await afterCreate({ node, dataSchema: nodeClass.dataSchema });
		},
		$inferClassNames: "" as keyof TNodeClasses,
	};
}
