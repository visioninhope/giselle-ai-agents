import { db, tasks } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { unstable_cache } from "next/cache";
import { Fetcher } from "./fetcher";
import { RefreshButton } from "./refresh-button";
import { RevalidateButton } from "./revalidate-button";

const getTasks = async (userId: string) =>
	unstable_cache(
		async () => {
			console.log("calling getTasks");
			const allTasks = await db.select().from(tasks);
			return allTasks;
		},
		[userId],
		{
			tags: ["tasks"],
		},
	)();
const getTasks2 = async (userId: string) =>
	unstable_cache(
		async () => {
			console.log("calling getTasks2");
			const allTasks = await db.select().from(tasks);
			return allTasks;
		},
		[userId],
		{
			tags: ["tasks2"],
		},
	)();

export default async function TasksPage() {
	const user = await getUser();
	const allTasks = await getTasks(user.id);
	const allTasks2 = await getTasks2(user.id);
	return (
		<div>
			<RefreshButton />
			<RevalidateButton />
			<div className="flex gap-4">
				<ul>
					{allTasks.map((task) => (
						<li key={task.id}>{task.name}</li>
					))}
				</ul>
				<ul>
					{allTasks2.map((task) => (
						<li key={task.id}>{task.name}</li>
					))}
				</ul>
				<Fetcher />
			</div>
		</div>
	);
}
