import { db, supabaseUserMappings, users } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

export async function getUserId() {
	const supabaseUser = await getUser();
	const [result] = await db
		.select()
		.from(users)
		.innerJoin(
			supabaseUserMappings,
			eq(users.dbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id));
	return result.users.id;
}
