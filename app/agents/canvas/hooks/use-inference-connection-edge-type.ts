import { useBlueprint } from "@/app/agents/blueprints";
import type { EdgeType } from "@/drizzle";
import type {
	Connection as XYFlowConnection,
	Edge as XYFlowEdge,
} from "@xyflow/react";
import { useCallback } from "react";
import invariant from "tiny-invariant";

type Connection = {
	source: number;
	sourceHandle: number;
	target: number;
	targetHandle: number;
};
export const convertXyFlowConnection = (
	xyFlowConnection: XYFlowConnection,
): Connection => ({
	source: Number.parseInt(xyFlowConnection.source, 10),
	sourceHandle: Number.parseInt(xyFlowConnection.sourceHandle ?? "", 10),
	target: Number.parseInt(xyFlowConnection.target, 10),
	targetHandle: Number.parseInt(xyFlowConnection.targetHandle ?? "", 10),
});

export const useInfereceConnectionEdgeType = () => {
	const { blueprint } = useBlueprint();
	const getPorts = useCallback(
		({ source, sourceHandle, target, targetHandle }: Connection) => {
			const sourceNode = blueprint.nodes.find((node) => node.id === source);
			const sourcePort = sourceNode?.outputPorts.find(
				(port) => port.id === sourceHandle,
			);
			const targetNode = blueprint.nodes.find((node) => node.id === target);
			const targetPort = targetNode?.inputPorts.find(
				(port) => port.id === targetHandle,
			);
			if (sourcePort == null || targetPort == null) {
				return {
					inputPort: null,
					outputPort: null,
				};
			}
			return {
				inputPort: targetPort,
				outputPort: sourcePort,
			};
		},
		[blueprint],
	);
	const validateConnection = useCallback(
		(connection: Connection) => {
			const ports = getPorts(connection);
			if (ports == null) {
				return false;
			}
			return ports.inputPort?.type === ports.outputPort?.type;
		},
		[getPorts],
	);
	const inferConnectionEdgeType = useCallback(
		(connection: Connection): EdgeType => {
			const ports = getPorts(connection);
			invariant(ports.inputPort != null, "Ports not found");
			return ports.inputPort.type;
		},
		[getPorts],
	);
	return { inferConnectionEdgeType, validateConnection };
};
