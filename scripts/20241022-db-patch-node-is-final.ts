import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

console.log("Add 'isFinal' to the all of the nodes...");
const listOfAgents = await db
	.select()
	.from(agents)
	.where(eq(agents.id, "agnt_a23elgoizppud3e8bygx39ea"));
console.log(`Updating ${listOfAgents.length} agents...`);

const agentChunks = chunkArray(listOfAgents, 10);

for (let i = 0; i < agentChunks.length; i++) {
	const chunk = agentChunks[i];
	console.log(
		`  ├ Processing chunk ${i + 1}/${agentChunks.length} (${chunk.length} agents)`,
	);

	await Promise.all(
		chunk.map(async (agent) => {
			await db.update(agents).set({
				graphv2: {
					...agent.graphv2,
					nodes: agent.graphv2.nodes.map((node) => ({
						...node,
						isFinal: false,
					})),
				},
			});
		}),
	);

	console.log(`  │ └ Completed chunk ${i + 1}/${i + 1}`);
}
console.log("All agents have been updated!");
