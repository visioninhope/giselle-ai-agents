"use server";

import { blueprints, db, nodes } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type UpdateNodePropertyArgs = {
	blueprintId: number;
	node: {
		id: number;
		data: {
			name: string;
			value: string;
		};
	};
};
export const updateNodeData = async (args: UpdateNodePropertyArgs) => {
	const [node] = await db
		.select()
		.from(nodes)
		.where(eq(nodes.id, args.node.id));
	await db
		.update(nodes)
		.set({
			data: {
				...node.data,
				[args.node.data.name]: args.node.data.value,
			},
		})
		.where(eq(nodes.id, node.id));

	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, args.blueprintId));
	return {
		node: {
			id: node.id,
			data: {
				name: args.node.data.name,
				value: args.node.data.value,
			},
		},
	};
};
