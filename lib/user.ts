import {
	db,
	supabaseUserMappings,
	users,
} from "@/drizzle";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase";

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
