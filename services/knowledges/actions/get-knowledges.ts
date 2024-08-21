"use server";
import {
	db,
	files,
	knowledgeContentOpenaiVectorStoreFileRepresentations,
	knowledgeContents,
	knowledgeOpenaiVectorStoreRepresentations,
	knowledges as knowledgesSchema,
} from "@/drizzle";
import { openai } from "@/lib/openai";
import { eq, inArray } from "drizzle-orm";
import type { CursorPage } from "openai/pagination";
import type { VectorStoreFile } from "openai/resources/beta/vector-stores/files";
import type { Knowledge, KnowledgeContent } from "../type";

type GetKnowledgesArgs = {
	blueprintId: number;
};

export const getKnowledges = async (args: GetKnowledgesArgs) => {
	const dbKnowledges = await db
		.select({
			id: knowledgesSchema.id,
			name: knowledgesSchema.name,
			openaiVectorStoreId:
				knowledgeOpenaiVectorStoreRepresentations.openaiVectorStoreId,
		})
		.from(knowledgesSchema)
		.innerJoin(
			knowledgeOpenaiVectorStoreRepresentations,
			eq(
				knowledgeOpenaiVectorStoreRepresentations.knowledgeId,
				knowledgesSchema.id,
			),
		)
		.where(eq(knowledgesSchema.blueprintId, args.blueprintId));
	const dbKnowledgeContents = await db
		.select({
			id: knowledgeContents.id,
			type: knowledgeContents.type,
			name: knowledgeContents.name,
			fileId: files.id,
			fileName: files.fileName,
			fileType: files.fileType,
			knowledgeId: knowledgeContents.knowledgeId,
			openaiVectorStoreFileId:
				knowledgeContentOpenaiVectorStoreFileRepresentations.openaiVectorStoreFileId,
		})
		.from(files)
		.innerJoin(knowledgeContents, eq(knowledgeContents.fileId, files.id))
		.innerJoin(
			knowledgeContentOpenaiVectorStoreFileRepresentations,
			eq(
				knowledgeContentOpenaiVectorStoreFileRepresentations.knowledgeContentId,
				knowledgeContents.id,
			),
		)
		.where(
			inArray(
				knowledgeContents.knowledgeId,
				dbKnowledges.map(({ id }) => id),
			),
		);
	const knowledges: Knowledge[] = [];
	for (const dbKnowledge of dbKnowledges) {
		const vectorStoreFiles = await retrieveVectorStoreFiles(
			dbKnowledge.openaiVectorStoreId,
		);
		const contents = dbKnowledgeContents
			.filter(({ knowledgeId }) => knowledgeId === dbKnowledge.id)
			.map((dbKnowledgeContent) => {
				const vectorStoreFile = vectorStoreFiles.find(
					({ id }) => id === dbKnowledgeContent.openaiVectorStoreFileId,
				);
				if (vectorStoreFile == null) {
					return null;
				}
				const knowledgeContent: KnowledgeContent = {
					id: dbKnowledgeContent.id,
					name: dbKnowledgeContent.name,
					type: dbKnowledgeContent.type,
					status: vectorStoreFile.status,
					file: {
						id: dbKnowledgeContent.fileId,
					},
				};
				return knowledgeContent;
			})
			.filter((content) => content != null);
		knowledges.push({
			id: dbKnowledge.id,
			name: dbKnowledge.name,
			contents,
		});
	}
	return knowledges;
};

const retrieveVectorStoreFiles = async (
	vectorStoreId: string,
): Promise<VectorStoreFile[]> => {
	const recursiveList = async (
		fileList: CursorPage<VectorStoreFile>,
	): Promise<VectorStoreFile[]> => {
		const files = fileList.data;

		if (fileList.hasNextPage()) {
			const nextPage = await fileList.getNextPage();
			const nextPageFiles = await recursiveList(nextPage);
			return [...files, ...nextPageFiles];
		}

		return files;
	};

	const initialFileList =
		await openai.beta.vectorStores.files.list(vectorStoreId);
	return recursiveList(initialFileList);
};
