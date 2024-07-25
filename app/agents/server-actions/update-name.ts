"use server";

import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";

type UpdateNameArgs = {
	id: number;
	name: string;
};
export const updateName = async ({ id, name }: UpdateNameArgs) => {
	await db.update(agents).set({ name }).where(eq(agents.id, id));
};
