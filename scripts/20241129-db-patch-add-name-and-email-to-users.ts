/**
 * This script updates email addresses in the users table by synchronizing with Supabase Auth.
 *
 * The script:
 * 1. Fetches users from Supabase Auth API with pagination (100 users per page)
 * 2. For each user, updates the email in the users table using supabaseUserMappings as a join table
 * 3. Handles errors gracefully and continues processing even if individual updates fail
 * 4. Logs progress and any errors that occur during the process
 *
 * Requirements:
 * - Supabase service role key for authentication
 * - Access to users and supabaseUserMappings tables
 * - Proper database permissions for UPDATE operations
 */

import { db, supabaseUserMappings, users as usersSchema } from "@/drizzle";
import { createClient } from "@supabase/supabase-js";
import { sql } from "drizzle-orm";

async function main() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
	const key = process.env.SUPABASE_SERVICE_KEY as string;
	const supabase = createClient(url, key);

	const perPage = 100;
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const {
			data: { users },
			error,
		} = await supabase.auth.admin.listUsers({
			page,
			perPage,
		});

		if (error) {
			throw error;
		}

		console.log(`Processing page ${page}, found ${users.length} users`);

		for (const user of users) {
			const { id: supabaseUserId, email } = user;
			if (!email) continue;

			try {
				await db.execute(
					sql`
            UPDATE ${usersSchema}
            SET email = ${email}
            FROM ${supabaseUserMappings}
            WHERE ${usersSchema.dbId} = ${supabaseUserMappings.userDbId}
            AND ${supabaseUserMappings.supabaseUserId} = ${supabaseUserId}
          `,
				);

				console.log(`Updated user ${supabaseUserId} with email ${email}`);
			} catch (err) {
				console.error(`Failed to update user ${supabaseUserId}:`, err);
			}
		}

		hasMore = users.length === perPage;
		page++;
	}

	console.log("Finished processing all users");
}

main().catch((error) => {
	console.error("error", error);
	process.exit(1);
});
