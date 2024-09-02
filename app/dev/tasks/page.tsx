import { db, tasks } from "@/drizzle";
import { RefreshButton } from "./refresh-button";
import { RevalidateButton } from "./revalidate-button";

const getTasks = async () => {
	console.log("calling getTasks");
	const allTasks = await db.select().from(tasks);
	return allTasks;
};

export default async function TasksPage() {
	const allTasks = await getTasks();
	return (
		<div>
			<RefreshButton />
			<RevalidateButton />
			<ul>
				{allTasks.map((task) => (
					<li key={task.id}>{task.name}</li>
				))}
			</ul>
		</div>
	);
}
