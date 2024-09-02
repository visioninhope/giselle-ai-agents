// "use server";

// import {
// 	type KnowledgeContentType,
// 	db,
// 	fileOpenaiFileRepresentations,
// 	files,
// 	knowledgeContentOpenaiVectorStoreFileRepresentations,
// 	knowledgeContents,
// 	knowledgeOpenaiVectorStoreRepresentations,
// } from "@/drizzle";
// import { openai } from "@/lib/openai";
// import { put } from "@vercel/blob";
// import { and, eq } from "drizzle-orm";
// import type { KnowledgeContent } from "../type";

// type AddContentToKnowledgeArgs = {
// 	content: {
// 		type: KnowledgeContentType;
// 		name: string;
// 		file: File;
// 	};
// 	knowledgeId: number;
// };
// export const addContentToKnowledge = async (
// 	args: AddContentToKnowledgeArgs,
// ) => {
// 	const blob = await put(args.content.file.name, args.content.file, {
// 		access: "public",
// 		contentType: args.content.file.type,
// 	});
// 	const [file] = await db
// 		.insert(files)
// 		.values({
// 			fileName: args.content.file.name,
// 			fileType: args.content.file.type,
// 			fileSize: args.content.file.size,
// 			blobUrl: blob.url,
// 		})
// 		.returning({ id: files.id });

// 	const [knowledgeContent] = await db
// 		.insert(knowledgeContents)
// 		.values({
// 			name:
// 				args.content.type === "text"
// 					? args.content.name.replace(/\.[^.]+$/, "")
// 					: args.content.name,
// 			type: args.content.type,
// 			fileId: file.id,
// 			knowledgeId: args.knowledgeId,
// 		})
// 		.returning({ id: knowledgeContents.id });

// 	const openaiFile = await openai.files.create({
// 		file: args.content.file,
// 		purpose: "assistants",
// 	});
// 	await db.insert(fileOpenaiFileRepresentations).values({
// 		fileId: file.id,
// 		openaiFileId: openaiFile.id,
// 	});
// 	const [openaiVectorStore] = await db
// 		.select({
// 			id: knowledgeOpenaiVectorStoreRepresentations.openaiVectorStoreId,
// 		})
// 		.from(knowledgeOpenaiVectorStoreRepresentations)
// 		.where(
// 			and(
// 				eq(
// 					knowledgeOpenaiVectorStoreRepresentations.knowledgeId,
// 					args.knowledgeId,
// 				),
// 				eq(knowledgeOpenaiVectorStoreRepresentations.status, "completed"),
// 			),
// 		);
// 	const openaiVectorStoreFile = await openai.beta.vectorStores.files.create(
// 		openaiVectorStore.id,
// 		{
// 			file_id: openaiFile.id,
// 		},
// 	);

// 	await db.insert(knowledgeContentOpenaiVectorStoreFileRepresentations).values({
// 		knowledgeContentId: knowledgeContent.id,
// 		openaiVectorStoreFileId: openaiVectorStoreFile.id,
// 	});
// 	return {
// 		knowledgeId: args.knowledgeId,
// 		content: {
// 			id: knowledgeContent.id,
// 			name: args.content.name,
// 			type: args.content.type,
// 			status: openaiVectorStoreFile.status,
// 			openaiVectorStoreFileId: openaiVectorStoreFile.id,
// 			file: {
// 				id: file.id,
// 				openaiFileId: openaiFile.id,
// 			},
// 		},
// 	};
// };
