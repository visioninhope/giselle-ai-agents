"use server";

import { db, ports } from "@/drizzle";
import { eq } from "drizzle-orm";

type UpdatePortNameArgs = {
	portId: number;
	name: string;
};

export const updatePortName = async (args: UpdatePortNameArgs) => {
	await db
		.update(ports)
		.set({
			name: args.name,
		})
		.where(eq(ports.id, args.portId));
	return args;
};
