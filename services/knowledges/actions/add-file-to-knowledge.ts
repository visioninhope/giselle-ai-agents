"use server";

import {
	db,
	fileOpenaiFileRepresentations,
	files,
	knowledgeAffiliations,
	knowledgeAfflicationOpenaiVectorStoreFileRepresentations,
	knowledgeOpenaiVectorStoreRepresentations,
} from "@/drizzle";
import { openai } from "@/lib/openai";
import { put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";

type AddFileToKnowledgeArgs = {
	file: File;
	knowledgeId: number;
};
export const addFileToKnowledge = async (args: AddFileToKnowledgeArgs) => {
	const blob = await put(args.file.name, args.file, {
		access: "public",
		contentType: args.file.type,
	});
	const [file] = await db
		.insert(files)
		.values({
			fileName: args.file.name,
			fileType: args.file.type,
			fileSize: args.file.size,
			blobUrl: blob.url,
		})
		.returning({ id: files.id });
	const [knowledgeAffiliation] = await db
		.insert(knowledgeAffiliations)
		.values({
			fileId: file.id,
			knowledgeId: args.knowledgeId,
		})
		.returning({ id: knowledgeAffiliations.id });
	const openaiFile = await openai.files.create({
		file: args.file,
		purpose: "assistants",
	});
	await db.insert(fileOpenaiFileRepresentations).values({
		fileId: file.id,
		openaiFileId: openaiFile.id,
	});
	const [openaiVectorStore] = await db
		.select({
			id: knowledgeOpenaiVectorStoreRepresentations.openaiVectorStoreId,
		})
		.from(knowledgeOpenaiVectorStoreRepresentations)
		.where(
			and(
				eq(
					knowledgeOpenaiVectorStoreRepresentations.knowledgeId,
					args.knowledgeId,
				),
				eq(knowledgeOpenaiVectorStoreRepresentations.status, "completed"),
			),
		);
	const openaiVectorStoreFile = await openai.beta.vectorStores.files.create(
		openaiVectorStore.id,
		{
			file_id: openaiFile.id,
		},
	);

	await db
		.insert(knowledgeAfflicationOpenaiVectorStoreFileRepresentations)
		.values({
			knowledgeAffiliationId: knowledgeAffiliation.id,
			openaiVectorStoreFileId: openaiVectorStoreFile.id,
		});
	return {
		knowledgeId: args.knowledgeId,
		file: {
			id: file.id,
			fileName: args.file.name,
		},
	};
};
