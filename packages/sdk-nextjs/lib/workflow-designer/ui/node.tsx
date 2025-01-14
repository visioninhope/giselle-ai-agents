import type { NodeData } from "@/lib/workflow-data";

export function Node({ data }: { data: NodeData }) {
	return <div>{data.name}</div>;
}
