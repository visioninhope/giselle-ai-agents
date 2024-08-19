"use server";

import { db, nodes, ports } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type DeletePortArgs = {
	blueprintId: number;
	deletePortId: number;
};

export const deletePort = async ({ deletePortId }: DeletePortArgs) => {
	await db.delete(ports).where(and(eq(ports.id, deletePortId)));
	return {
		deletePortId,
	};
};
