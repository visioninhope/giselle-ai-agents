"use client";

import { db, type tasks } from "@/drizzle";
import { type FC, useEffect, useState } from "react";
import { getTasks } from "./get-tasks";

export const Fetcher: FC = () => {
	const [t, setT] = useState<(typeof tasks.$inferSelect)[]>([]);
	useEffect(() => {
		getTasks().then((ta) => {
			setT(ta);
		});
	}, []);
	return (
		<div>
			<h1>Fetcher</h1>

			<ul>
				{t.map((task) => (
					<li key={task.id}>{task.name}</li>
				))}
			</ul>
		</div>
	);
};
