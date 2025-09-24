import { Buffer } from "node:buffer";

import { createId } from "@paralleldrive/cuid2";
import { createClient } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db, documentVectorStores } from "@/drizzle";
import { docVectorStoreFlag } from "@/flags";
import type { DocumentVectorStoreId } from "@/packages/types";
import { fetchCurrentTeam } from "@/services/teams";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STORAGE_BUCKET =
	process.env.DOCUMENT_VECTOR_STORE_STORAGE_BUCKET ?? "app";
const STORAGE_PREFIX = "vector-stores";
const MAX_FILE_SIZE_BYTES = Math.floor(4.5 * 1024 * 1024);
const MAX_FILE_SIZE_MB = 4.5;

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

async function verifyStoreAccess(
	documentVectorStoreId: DocumentVectorStoreId,
	teamDbId: number,
) {
	const [store] = await db
		.select({ id: documentVectorStores.id })
		.from(documentVectorStores)
		.where(
			and(
				eq(documentVectorStores.id, documentVectorStoreId),
				eq(documentVectorStores.teamDbId, teamDbId),
			),
		)
		.limit(1);

	return Boolean(store);
}

function isPdfFile(file: File) {
	if (file.type === "application/pdf") {
		return true;
	}
	return file.name.toLowerCase().endsWith(".pdf");
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
	request: Request,
	context: { params: { documentVectorStoreId: string } },
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

	const documentVectorStoreId = context.params
		.documentVectorStoreId as DocumentVectorStoreId;
	const hasAccess = await verifyStoreAccess(documentVectorStoreId, team.dbId);
	if (!hasAccess) {
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

		if (file.size > MAX_FILE_SIZE_BYTES) {
			return NextResponse.json(
				{
					error: `${file.name} exceeds the ${MAX_FILE_SIZE_MB.toFixed(1)}MB limit`,
				},
				{ status: 413 },
			);
		}

		const sanitizedFileName = sanitizePdfFileName(file.name);
		const storageKey = buildStorageKey(
			documentVectorStoreId,
			sanitizedFileName,
		);
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const { error } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(storageKey, buffer, {
				contentType: "application/pdf",
				upsert: true,
			});

		if (error) {
			return NextResponse.json(
				{ error: `Failed to upload ${file.name}` },
				{ status: 500 },
			);
		}
	}

	return NextResponse.json({ success: true });
}
