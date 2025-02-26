import { Node as GiselleNode } from "@giselle-sdk/data-type";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { useMemo } from "react";
import { SourceExtension } from "../extensions/source-extension";

const Component = (props: NodeViewProps) => {
	const node = useMemo(
		() =>
			GiselleNode.array()
				.parse(props.editor.storage.Source.nodes)
				.find((node) => node.id === props.node.attrs.node.id),
		[props.editor, props.node.attrs.node],
	);

	const output = useMemo(
		() =>
			node?.outputs.find((output) => output.id === props.node.attrs.outputId),
		[node, props.node.attrs.outputId],
	);

	return (
		<NodeViewWrapper className="inline">
			<span
				contentEditable={false}
				className="bg-primary-900/20 rounded-[4px] px-[4px] py-[2px] text-primary-900 text-[12px]"
			>
				{node?.name} / {output?.label}
			</span>
		</NodeViewWrapper>
	);
};

interface SourceExtensionReactOptions {
	nodes: GiselleNode[];
}
interface SourceExtensionReactStorage {
	nodes: GiselleNode[];
}

export const SourceExtensionReact = SourceExtension.extend<
	SourceExtensionReactOptions,
	SourceExtensionReactStorage
>({
	addOptions() {
		return {
			nodes: [],
		};
	},

	addStorage() {
		return {
			nodes: [],
		};
	},

	onBeforeCreate() {
		this.storage.nodes = this.options.nodes;
	},

	onUpdate() {
		this.storage.nodes = this.options.nodes;
	},

	addNodeView() {
		return ReactNodeViewRenderer(Component);
	},
});
