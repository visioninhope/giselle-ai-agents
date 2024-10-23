import { useMemo } from "react";
import bg from "./bg.png";
import { WilliIcon } from "./components/icons/willi";
import type { ConnectorObject } from "./connector/types";
import {
	type GiselleNodeId,
	giselleNodeCategories,
} from "./giselle-node/types";
import { useGraph } from "./graph/context";
import { Header } from "./header";

function getRelevantConnectors(
	connectors: ConnectorObject[],
	targetNode: GiselleNodeId,
): ConnectorObject[] {
	const relevantConnectors: ConnectorObject[] = [];
	const relevantNodes = new Set<GiselleNodeId>([targetNode]);
	let connectorsToProcess = connectors.filter(
		(connector) => connector.target === targetNode,
	);

	while (connectorsToProcess.length > 0) {
		relevantConnectors.push(...connectorsToProcess);
		const sourceNodes = connectorsToProcess.map(
			(connector) => connector.source,
		);
		for (const node of sourceNodes) {
			relevantNodes.add(node);
		}

		connectorsToProcess = connectors.filter(
			(connector) =>
				!relevantConnectors.includes(connector) &&
				sourceNodes.includes(connector.target),
		);
	}

	return relevantConnectors;
}

function buildDependencyGraph(
	connectors: ConnectorObject[],
): Map<GiselleNodeId, Set<GiselleNodeId>> {
	const dependencyMap = new Map<GiselleNodeId, Set<GiselleNodeId>>();

	for (const connector of connectors) {
		if (connector.sourceNodeCategory === giselleNodeCategories.instruction) {
			continue;
		}
		if (!dependencyMap.has(connector.source)) {
			dependencyMap.set(connector.source, new Set());
		}
		if (!dependencyMap.has(connector.target)) {
			dependencyMap.set(connector.target, new Set());
		}
		dependencyMap.get(connector.target)?.add(connector.source);
	}

	return dependencyMap;
}

function resolveTargetDependencies(
	connectors: ConnectorObject[],
	targetNode: GiselleNodeId,
): GiselleNodeId[][] {
	const relevantConnectors = getRelevantConnectors(connectors, targetNode);
	const dependencyMap = buildDependencyGraph(relevantConnectors);

	const result: GiselleNodeId[][] = [];
	const visited = new Set<GiselleNodeId>();
	const nodes = Array.from(dependencyMap.keys());

	while (visited.size < nodes.length) {
		const currentLayer: GiselleNodeId[] = [];

		for (const node of nodes) {
			if (!visited.has(node)) {
				const dependencies = dependencyMap.get(node) || new Set();
				const isReady = Array.from(dependencies).every((dep) =>
					visited.has(dep),
				);

				if (isReady) {
					currentLayer.push(node);
				}
			}
		}

		if (currentLayer.length === 0 && visited.size < nodes.length) {
			throw new Error("Circular dependency detected");
		}

		for (const node of currentLayer) {
			visited.add(node);
		}
		result.push(currentLayer);
	}

	return result;
}

export function Viewer() {
	const { state } = useGraph();
	const dependencies = useMemo(() => {
		if (state.graph.flow == null) {
			return null;
		}
		return resolveTargetDependencies(
			state.graph.connectors,
			state.graph.flow.finalNodeId,
		);
	}, [state.graph]);
	return (
		<div
			className="w-full h-screen bg-black-100 flex flex-col"
			style={{
				backgroundImage: `url(${bg.src})`,
				backgroundPositionX: "center",
				backgroundPositionY: "center",
				backgroundSize: "cover",
			}}
		>
			<Header />
			<div className="flex-1 flex flex-col items-center divide-y mx-[20px]">
				<div className="flex items-center h-[40px]">
					{state.graph.flow == null ? (
						<div className="text-black-70 font-[800] text-[18px]">No exist</div>
					) : (
						<div className="text-black-70 font-[800] text-[18px]">
							{state.graph.flow.finalNodeId}
						</div>
					)}
				</div>
				<div className="flex-1 w-full flex items-center justify-center">
					{state.graph.flow == null ? (
						<div className="flex flex-col items-center gap-[8px]">
							<WilliIcon className="fill-black-70 w-[32px] h-[32px]" />
							<p className="font-[800] text-black-30">
								This has not yet been executed
							</p>
							<p className="text-black-70 text-[12px] text-center leading-5">
								You have not yet executed the node. <br />
								Let's execute the entire thing and create the final output.
							</p>
						</div>
					) : (
						<pre>{JSON.stringify(dependencies, null, 2)}</pre>
					)}
				</div>
			</div>
		</div>
	);
}
