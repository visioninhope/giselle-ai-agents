"use server";

import { builds, db, requests } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export const createRequest = async (
	buildId: (typeof builds.$inferInsert)["id"],
) => {
	const [build] = await db
		.select({ dbId: builds.dbId })
		.from(builds)
		.where(eq(builds.id, buildId));
	const id = `rqst_${createId()}` as const;
	const [newRequest] = await db
		.insert(requests)
		.values({
			id: id,
			buildDbId: build.dbId,
		})
		.returning({
			dbId: requests.dbId,
		});
	return { id, dbId: newRequest.dbId };
};
