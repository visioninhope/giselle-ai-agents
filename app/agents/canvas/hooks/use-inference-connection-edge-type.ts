import { useBlueprint } from "@/app/agents/blueprints";
import type { Connection, Edge } from "@xyflow/react";
import { useCallback } from "react";
import invariant from "tiny-invariant";

export const useInfereceConnectionEdgeType = () => {
	const blueprint = useBlueprint();
	const getPorts = useCallback(
		({ source, sourceHandle, target, targetHandle }: Connection | Edge) => {
			const sourceNode = blueprint.nodes.find(
				(node) => node.id === Number.parseInt(source, 10),
			);
			const sourcePort = sourceNode?.outputPorts.find(
				(port) => port.id === Number.parseInt(sourceHandle ?? "", 10),
			);
			const targetNode = blueprint.nodes.find(
				(node) => node.id === Number.parseInt(target, 10),
			);
			const targetPort = targetNode?.inputPorts.find(
				(port) => port.id === Number.parseInt(targetHandle ?? "", 10),
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
		(connection: Connection | Edge) => {
			const ports = getPorts(connection);
			if (ports == null) {
				return false;
			}
			return ports.inputPort?.type === ports.outputPort?.type;
		},
		[getPorts],
	);
	const inferConnectionEdgeType = useCallback(
		(connection: Connection | Edge) => {
			const ports = getPorts(connection);
			invariant(ports.inputPort != null, "Ports not found");
			return ports.inputPort.type;
		},
		[getPorts],
	);
	return { inferConnectionEdgeType, validateConnection };
};
