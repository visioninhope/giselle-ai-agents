import { NodeId } from "@giselle-sdk/data-type";
import type { NodeProps as RFNodeProps } from "@xyflow/react";
import clsx from "clsx";
import { shallow } from "zustand/shallow";
import { useEditorStoreWithEqualityFn } from "../../store/context";

export function Node({ id }: RFNodeProps) {
	const node = useEditorStoreWithEqualityFn(
		(s) => s.nodesById[NodeId.parse(id)],
		shallow,
	);
	return (
		<div
			className={clsx(
				"group relative flex flex-col rounded-[16px] py-[16px] gap-[16px] min-w-[180px]",
				"bg-gradient-to-tl transition-all backdrop-blur-[4px]",
			)}
		>
			{node.name}
		</div>
	);
}
