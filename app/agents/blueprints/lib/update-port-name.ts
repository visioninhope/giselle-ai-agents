"use server";

import { db, ports } from "@/drizzle";
import { eq } from "drizzle-orm";

type UpdatePortNameArgs = {
	port: {
		id: number;
		name: string;
	};
};

export const updatePortName = async (args: UpdatePortNameArgs) => {
	await db
		.update(ports)
		.set({
			name: args.port.name,
		})
		.where(eq(ports.id, args.port.id));
};
