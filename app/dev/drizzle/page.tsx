// import { db, nodes } from "@/drizzle";
// import { and, arrayContains, eq, sql } from "drizzle-orm";

// export default async function () {
// 	// await updateNode(11, 13, 14);
// 	const o = 13;
// 	const n = 14;
// 	const data = await db
// 		.update(nodes)
// 		.set({
// 			data: sql`
//     		JSONB_SET(
//           ${nodes.data},
//           '{knowledgeIds}',
//           (
//             SELECT
//               JSONB_AGG(
//                 CASE
//                   WHEN VALUE::TEXT = ${o}::TEXT THEN ${n}::JSONB
//                   ELSE VALUE
//                 END
//               )
//             FROM
//               JSONB_ARRAY_ELEMENTS(${nodes.data} -> 'knowledgeIds')
//           ),
//           TRUE
//         )
//   `,
// 		})
// 		.where(
// 			and(
// 				eq(nodes.blueprintId, 11),
// 				arrayContains(sql`${nodes.data} -> 'knowledgeIds'`, [13]),
// 			),
// 		);
// 	return <div>OK</div>;
// }

// const updateNode = async (
// 	newBlueprintId: number,
// 	currentKnowledgeId: number,
// 	newKnowledgeId: number,
// ) => {
// 	await db
// 		.update(nodes)
// 		.set({
// 			data: sql`
//       		JSONB_SET(
//             ${nodes.data},
//             '{knowledgeIds}',
//             (
//               SELECT
//                 JSONB_AGG(
//                   CASE
//                     WHEN VALUE::TEXT = '${currentKnowledgeId}' THEN '${newKnowledgeId}'
//                     ELSE VALUE
//                   END
//                 )
//               FROM
//                 JSONB_ARRAY_ELEMENTS(${nodes.data} -> 'knowledgeIds')
//             ),
//             TRUE
//           )
//     `,
// 		})
// 		.where(
// 			and(
// 				eq(nodes.blueprintId, newBlueprintId),
// 				arrayContains(sql`${nodes.data} -> 'knowledgeIds'`, [
// 					currentKnowledgeId,
// 				]),
// 			),
// 		);
// };
