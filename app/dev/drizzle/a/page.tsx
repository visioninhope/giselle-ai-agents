import { db, nodes } from "@/drizzle";
import { sql } from "drizzle-orm";

export default async function Page() {
	const query = db.select().from(nodes);
	const query2 = db.select().from(sql`node_connections`);
	await db.execute(sql`WITH node_connections as (${query}) ${query2}`);
	return <div>hello</div>;
}
