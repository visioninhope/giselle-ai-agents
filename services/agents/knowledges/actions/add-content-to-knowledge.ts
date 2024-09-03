"use server";

import {
	db,
	fileOpenaiFileRepresentations,
	files,
	knowledgeContentOpenaiVectorStoreFileRepresentations,
	knowledgeContents,
	knowledgeOpenaiVectorStoreRepresentations,
	knowledges,
} from "@/drizzle";
import { openai } from "@/lib/openai";
import { createId } from "@paralleldrive/cuid2";
import { put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import type { KnowledgeContentType, KnowledgeId } from "../types";
import { revalidateGetKnowledgeContents } from "./get-knowledge-contents";

type AddContentToKnowledgeArgs = {
	knowledgeId: KnowledgeId;
	content: {
		name: string;
		type: KnowledgeContentType;
		file: File;
	};
};
export const addContentToKnowledge = async (
	args: AddContentToKnowledgeArgs,
) => {
	const blob = await put(args.content.file.name, args.content.file, {
		access: "public",
		contentType: args.content.file.type,
	});
	const [knowledge] = await db
		.select({ dbId: knowledges.dbId })
		.from(knowledges)
		.where(eq(knowledges.id, args.knowledgeId));
	await db.transaction(async (tx) => {
		const [file] = await tx
			.insert(files)
			.values({
				id: `fl_${createId()}`,
				fileName: args.content.file.name,
				fileType: args.content.file.type,
				fileSize: args.content.file.size,
				blobUrl: blob.url,
			})
			.returning({ id: files.id, dbId: files.dbId });

		const [knowledgeContent] = await tx
			.insert(knowledgeContents)
			.values({
				id: `knwl.cnt_${createId()}`,
				name:
					args.content.type === "text"
						? args.content.name.replace(/\.[^.]+$/, "")
						: args.content.name,
				type: args.content.type,
				fileDbId: file.dbId,
				knowledgeDbId: knowledge.dbId,
			})
			.returning({ id: knowledgeContents.id, dbId: knowledgeContents.dbId });

		// const openaiFile = await openai.files.create({
		// 	file: args.content.file,
		// 	purpose: "assistants",
		// });
		// await tx.insert(fileOpenaiFileRepresentations).values({
		// 	fileDbId: file.dbId,
		// 	openaiFileId: openaiFile.id,
		// });
		// const [openaiVectorStore] = await tx
		// 	.select({
		// 		id: knowledgeOpenaiVectorStoreRepresentations.openaiVectorStoreId,
		// 	})
		// 	.from(knowledgeOpenaiVectorStoreRepresentations)
		// 	.where(
		// 		and(
		// 			eq(
		// 				knowledgeOpenaiVectorStoreRepresentations.knowledgeDbId,
		// 				knowledge.dbId,
		// 			),
		// 			eq(
		// 				knowledgeOpenaiVectorStoreRepresentations.openaiVectorStoreStatus,
		// 				"completed",
		// 			),
		// 		),
		// 	);
		// const openaiVectorStoreFile = await openai.beta.vectorStores.files.create(
		// 	openaiVectorStore.id,
		// 	{
		// 		file_id: openaiFile.id,
		// 	},
		// );

		// await tx
		// 	.insert(knowledgeContentOpenaiVectorStoreFileRepresentations)
		// 	.values({
		// 		knowledgeContentDbId: knowledgeContent.dbId,
		// 		openaiVectorStoreFileId: openaiVectorStoreFile.id,
		// 		openaiVectorStoreFileStatus: "in_progress",
		// 	});
	});
	await revalidateGetKnowledgeContents(args.knowledgeId);
};
