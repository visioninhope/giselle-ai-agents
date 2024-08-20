"use server";

import { db, files, knowledgeAffiliations } from "@/drizzle";
import { put } from "@vercel/blob";

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
	await db.insert(knowledgeAffiliations).values({
		fileId: file.id,
		knowledgeId: args.knowledgeId,
	});
	return {
		knowledgeId: args.knowledgeId,
		file: {
			id: file.id,
			fileName: args.file.name,
		},
	};
};
