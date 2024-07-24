"use server";

import { db } from "@/drizzle";
import { sql } from "drizzle-orm";

type GetDependedNodesArgs = {
	requestId: number;
	nodeId: number;
};

type DependedNode = {
	source_node_id: number;
	input_port_id: number;
	output_port_id: number;
	target_node_id: number;
	target_node_class_name: string;
	depth: number;
};
type AssertDependedNodes = (
	result: unknown,
) => asserts result is DependedNode[];

/** @todo */
const assertDependedNodes: AssertDependedNodes = (result) => {};

export const getDependedNodes = async ({
	requestId,
	nodeId,
}: GetDependedNodesArgs) => {
	const result = await db.execute(sql`
	WITH RECURSIVE
    node_connections AS (
     SELECT
       nodes.id source_node_id,
       input_ports.id input_port_id,
       edges.output_port_id,
       output_nodes.id target_node_id,
       output_nodes.class_name target_node_class_name,
       1 AS depth
     FROM
       nodes
       INNER JOIN nodes_blueprints ON nodes_blueprints.node_id = nodes.id
       INNER JOIN requests ON requests.blueprint_id = nodes_blueprints.blueprint_id
       INNER JOIN ports input_ports ON input_ports.node_id = nodes.id
       AND input_ports.direction = 'input'
       AND input_ports.type = 'data'
       INNER JOIN edges ON edges.input_port_id = input_ports.id
       INNER JOIN edges_blueprints ON edges_blueprints.edge_id = edges.id
       AND edges_blueprints.blueprint_id = requests.blueprint_id
       INNER JOIN ports output_ports ON output_ports.id = edges.output_port_id
       INNER JOIN ports_blueprints output_ports_blueprints ON output_ports_blueprints.port_id = output_ports.id
       INNER JOIN nodes_blueprints output_nodes_blueprints ON output_nodes_blueprints.id = output_ports_blueprints.nodes_blueprints_id
       AND output_nodes_blueprints.blueprint_id = requests.blueprint_id
       INNER JOIN nodes output_nodes ON output_nodes.id = output_nodes_blueprints.node_id
     WHERE
       requests.id = ${requestId}
       AND NOT EXISTS (
        SELECT *
        FROM request_port_messages
        WHERE request_port_messages.request_id = requests.id
        AND request_port_messages.ports_blueprints_id = output_ports_blueprints.id
       )
   ),
   connection_tree AS (
     SELECT
       *
     FROM
       node_connections
     WHERE
       source_node_id = ${nodeId}
     UNION ALL
     SELECT
       node_connections.source_node_id,
       node_connections.input_port_id,
       node_connections.output_port_id,
       node_connections.target_node_id,
       node_connections.target_node_class_name,
       connection_tree.depth + 1 AS depth
     FROM
       node_connections
       INNER JOIN connection_tree ON connection_tree.target_node_id = node_connections.source_node_id
     WHERE
       connection_tree.depth < 10
   )
 SELECT
   *
 FROM
   connection_tree
 ORDER BY depth DESC
     `);
	assertDependedNodes(result.rows);
	return result.rows.map(({ target_node_id, target_node_class_name }) => ({
		id: target_node_id,
		className: target_node_class_name,
	}));
};
