"use server";

import type { Node } from "@/app/agents/blueprints";
import {
	type NodeClassName,
	type Port,
	getNodeClass,
} from "@/app/node-classes";
import {
	type NodeProperty,
	blueprints,
	db,
	nodeRepresentedAgents,
	nodes,
	nodesBlueprints,
	ports,
	portsBlueprints,
} from "@/drizzle";
import { and, eq } from "drizzle-orm";
import invariant from "tiny-invariant";

type AddagentNodeArgs = {
	blueprintId: number;
	node: {
		className: NodeClassName;
		position: { x: number; y: number };
		relevantAgent: {
			id: number;
			blueprintId: number;
		};
	};
};

const getRelevantAgentPorts = async (blueprintId: number): Promise<Port[]> => {
	const dbPorts = await db
		.select({
			portId: ports.id,
			portName: ports.name,
		})
		.from(ports)
		.innerJoin(portsBlueprints, eq(portsBlueprints.portId, ports.id))
		.innerJoin(
			nodesBlueprints,
			eq(nodesBlueprints.id, portsBlueprints.nodesBlueprintsId),
		)
		.innerJoin(
			nodes,
			and(
				eq(nodes.id, nodesBlueprints.nodeId),
				eq(nodes.className, "onRequest"),
			),
		)
		.where(
			and(
				eq(nodesBlueprints.blueprintId, blueprintId),
				eq(ports.direction, "output"),
				eq(ports.type, "data"),
			),
		);
	return dbPorts.map(({ portId, portName }) => ({
		type: "data",
		key: `${portId}`,
		label: portName,
	}));
};
export const addAgentNode = async (args: AddagentNodeArgs): Promise<Node> => {
	const blueprint = await db.query.blueprints.findFirst({
		where: eq(blueprints.id, args.blueprintId),
	});
	invariant(blueprint != null, `Blueprint not found: ${args.blueprintId}`);
	const relevantAgent = await db.query.agents.findFirst({
		where: (agents, { eq }) => eq(agents.id, args.node.relevantAgent.id),
	});
	invariant(
		relevantAgent != null,
		`Agent not found: ${args.node.relevantAgent.id}`,
	);
	const nodeClass = getNodeClass(args.node.className);
	const [node] = await db
		.insert(nodes)
		.values({
			agentId: blueprint.agentId,
			className: nodeClass.name,
			position: args.node.position,
		})
		.returning({
			id: nodes.id,
		});
	const relevantAgentInputPorts = await getRelevantAgentPorts(
		args.node.relevantAgent.blueprintId,
	);
	const inputPorts: (typeof ports.$inferInsert)[] = [
		...(nodeClass.inputPorts ?? []),
		...relevantAgentInputPorts,
	].map((port, index) => ({
		nodeId: node.id,
		type: port.type,
		direction: "input",
		order: index,
		name: port.label ?? "",
		nodeClassKey: port.key,
	}));
	const outputPorts: (typeof ports.$inferInsert)[] = (
		nodeClass.outputPorts ?? []
	).map((port, index) => ({
		nodeId: node.id,
		type: port.type,
		direction: "output",
		order: index,
		name: port.label ?? "",
		nodeClassKey: port.key,
	}));
	const insertedPorts = await db
		.insert(ports)
		.values([...inputPorts, ...outputPorts])
		.returning({
			id: ports.id,
		});
	const [nodeBlueprint] = await db
		.insert(nodesBlueprints)
		.values({
			nodeId: node.id,
			blueprintId: blueprint.id,
			nodeProperties: [
				{
					name: "relevantAgent",
					value: relevantAgent.name,
				} as NodeProperty,
			],
		})
		.returning({ id: nodesBlueprints.id });
	const insertedPortsBlueprints = await db
		.insert(portsBlueprints)
		.values(
			insertedPorts.map(({ id }) => ({
				portId: id,
				nodesBlueprintsId: nodeBlueprint.id,
			})),
		)
		.returning({ id: portsBlueprints.id });
	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, args.blueprintId));
	await db.insert(nodeRepresentedAgents).values({
		nodeId: node.id,
		agentId: args.node.relevantAgent.id,
		blueprintId: args.node.relevantAgent.blueprintId,
	});
	return {
		id: `${node.id}`,
		position: args.node.position,
		className: args.node.className,
		properties: [
			...(nodeClass.properties ?? []),
			{
				name: "relevantAgent",
				value: relevantAgent.name,
			} as NodeProperty,
		],
		inputPorts: inputPorts.map(({ nodeId, ...port }, index) => ({
			...port,
			id: `${insertedPorts[index].id}`,
			nodeId: `${nodeId}`,
			portsBlueprintsId: insertedPortsBlueprints[index].id,
			nodeClassKey: port.nodeClassKey ?? null,
		})),
		outputPorts: outputPorts.map(({ nodeId, ...port }, index) => ({
			...port,
			id: `${insertedPorts[index + inputPorts.length].id}`,
			nodeId: `${nodeId}`,
			portsBlueprintsId: insertedPortsBlueprints[index + inputPorts.length].id,
			nodeClassKey: port.nodeClassKey ?? null,
		})),
		propertyPortMap: nodeClass.propertyPortMap ?? {},
	};
};
