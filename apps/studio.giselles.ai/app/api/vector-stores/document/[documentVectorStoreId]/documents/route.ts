import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import { createId } from "@paralleldrive/cuid2";
import { createClient } from "@supabase/supabase-js";
import { and, eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
	db,
	documentVectorStoreSources,
	documentVectorStores,
} from "@/drizzle";
import { docVectorStoreFlag } from "@/flags";
import {
	DOCUMENT_VECTOR_STORE_MAX_FILE_SIZE_BYTES,
	DOCUMENT_VECTOR_STORE_MAX_FILE_SIZE_MB,
} from "@/lib/vector-stores/document/constants";
import { isPdfFile } from "@/lib/vector-stores/document/utils";
import type {
	DocumentVectorStoreId,
	DocumentVectorStoreSourceId,
} from "@/packages/types";
import { fetchCurrentTeam } from "@/services/teams";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STORAGE_BUCKET =
	process.env.DOCUMENT_VECTOR_STORE_STORAGE_BUCKET ?? "app";
const STORAGE_PREFIX = "vector-stores";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	throw new Error(
		"Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
	);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function ensureFeatureEnabled() {
	const enabled = await docVectorStoreFlag();
	if (!enabled) {
		return NextResponse.json({ error: "Not Found" }, { status: 404 });
	}
	return null;
}

async function fetchTeam() {
	try {
		return await fetchCurrentTeam();
	} catch (_error) {
		return null;
	}
}

async function findAccessibleStore(
	documentVectorStoreId: DocumentVectorStoreId,
	teamDbId: number,
) {
	const [store] = await db
		.select({
			dbId: documentVectorStores.dbId,
			id: documentVectorStores.id,
		})
		.from(documentVectorStores)
		.where(
			and(
				eq(documentVectorStores.id, documentVectorStoreId),
				eq(documentVectorStores.teamDbId, teamDbId),
			),
		)
		.limit(1);

	return store ?? null;
}

async function rollbackUploads(
	uploadedKeys: string[],
	createdSourceIds: DocumentVectorStoreSourceId[],
) {
	if (uploadedKeys.length > 0) {
		try {
			await supabase.storage.from(STORAGE_BUCKET).remove(uploadedKeys);
		} catch (cleanupError) {
			console.error(
				"Failed to roll back uploaded PDF files from storage:",
				cleanupError,
			);
		}
	}

	if (createdSourceIds.length > 0) {
		try {
			await db
				.delete(documentVectorStoreSources)
				.where(inArray(documentVectorStoreSources.id, createdSourceIds));
		} catch (cleanupError) {
			console.error(
				"Failed to roll back document vector store source records:",
				cleanupError,
			);
		}
	}
}

function sanitizePdfFileName(fileName: string): string {
	const trimmed = fileName.trim();
	const lower = trimmed.toLowerCase();
	const base = lower.endsWith(".pdf") ? trimmed.slice(0, -4) : trimmed;
	const sanitizedBase = base
		.replace(/[^a-z0-9-_]+/gi, "_")
		.replace(/_{2,}/g, "_");
	const finalBase = sanitizedBase.length > 0 ? sanitizedBase : "document";
	return `${finalBase}.pdf`;
}

function buildStorageKey(
	documentVectorStoreId: DocumentVectorStoreId,
	fileName: string,
) {
	return `${STORAGE_PREFIX}/${documentVectorStoreId}/${createId()}/${fileName}`;
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ documentVectorStoreId: string }> },
) {
	const featureGuard = await ensureFeatureEnabled();
	if (featureGuard) {
		return featureGuard;
	}

	const team = await fetchTeam();
	if (!team) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const files = formData
		.getAll("files")
		.filter((item): item is File => item instanceof File);

	if (files.length === 0) {
		return NextResponse.json({ error: "No files provided" }, { status: 400 });
	}

	const { documentVectorStoreId: documentVectorStoreIdParam } = await params;
	const documentVectorStoreId =
		documentVectorStoreIdParam as DocumentVectorStoreId;
	const store = await findAccessibleStore(documentVectorStoreId, team.dbId);
	if (!store) {
		return NextResponse.json(
			{ error: "Vector store not found" },
			{ status: 404 },
		);
	}

	for (const file of files) {
		if (!isPdfFile(file)) {
			return NextResponse.json(
				{ error: `${file.name} is not a PDF file` },
				{ status: 400 },
			);
		}

		if (file.size === 0) {
			return NextResponse.json(
				{ error: `${file.name} is empty and cannot be uploaded` },
				{ status: 400 },
			);
		}

		if (file.size > DOCUMENT_VECTOR_STORE_MAX_FILE_SIZE_BYTES) {
			return NextResponse.json(
				{
					error: `${file.name} exceeds the ${DOCUMENT_VECTOR_STORE_MAX_FILE_SIZE_MB.toFixed(1)}MB limit`,
				},
				{ status: 413 },
			);
		}
	}

	const uploadedKeys: string[] = [];
	const createdSourceIds: DocumentVectorStoreSourceId[] = [];

	for (const file of files) {
		const sanitizedFileName = sanitizePdfFileName(file.name);
		const storageKey = buildStorageKey(
			documentVectorStoreId,
			sanitizedFileName,
		);
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const checksum = createHash("sha256").update(buffer).digest("hex");

		const { error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(storageKey, buffer, {
				contentType: "application/pdf",
				upsert: true,
			});

		if (error) {
			await rollbackUploads(uploadedKeys, createdSourceIds);
			return NextResponse.json(
				{ error: `Failed to upload ${file.name}` },
				{ status: 500 },
			);
		}

		uploadedKeys.push(storageKey);

		const sourceId = `dvss_${createId()}` as DocumentVectorStoreSourceId;
		const originalFileName = file.name.trim() || sanitizedFileName;

		try {
			await db.insert(documentVectorStoreSources).values({
				id: sourceId,
				documentVectorStoreDbId: store.dbId,
				storageBucket: STORAGE_BUCKET,
				storageKey,
				fileName: originalFileName,
				fileSizeBytes: file.size,
				fileChecksum: checksum,
				uploadStatus: "uploaded",
			});
			createdSourceIds.push(sourceId);
		} catch (dbError) {
			console.error(
				"Failed to persist document vector store source metadata:",
				dbError,
			);
			await rollbackUploads(uploadedKeys, createdSourceIds);
			return NextResponse.json(
				{
					error: `Failed to save metadata for ${file.name}`,
				},
				{ status: 500 },
			);
		}
	}

	return NextResponse.json({ success: true });
}
