import { Buffer } from "node:buffer";
import type { PDFiumPage, PDFiumPageRender } from "@hyzyla/pdfium";
import { PNG } from "pngjs";

import { assertNotAborted } from "./internal/abort.js";
import { toUint8Array } from "./internal/binary.js";
import { withPdfDocument } from "./internal/pdfium.js";
import { normalizeExtractedText } from "./internal/text-normalizer.js";
import type {
	BinaryDataInput,
	PdfImagePage,
	PdfImageRenderOptions,
	PdfImageRenderResult,
	PdfTextExtractionOptions,
	PdfTextExtractionResult,
	PdfTextPage,
} from "./types.js";

const POINTS_PER_INCH = 72;
const DEFAULT_TARGET_DPI = 144;

export async function extractPdfText(
	input: BinaryDataInput,
	options: PdfTextExtractionOptions = {},
): Promise<PdfTextExtractionResult> {
	const bytes = toUint8Array(input);
	const { password, maxPages, signal } = options;

	return await withPdfDocument(
		bytes,
		{ password, signal },
		(document): PdfTextExtractionResult => {
			const totalPages = document.getPageCount();
			const limit = calculatePageLimit(totalPages, maxPages);
			const pages: PdfTextPage[] = [];

			for (let index = 0; index < limit; index += 1) {
				assertNotAborted(signal);
				const page = document.getPage(index);
				try {
					const rawText = page.getText();
					const text = normalizeExtractedText(rawText);
					pages.push({
						pageNumber: page.number + 1,
						text,
					});
				} finally {
					destroyPdfiumPage(page);
				}
			}

			return { totalPages, pages };
		},
	);
}

export async function renderPdfPageImages(
	input: BinaryDataInput,
	options: PdfImageRenderOptions = {},
): Promise<PdfImageRenderResult> {
	const bytes = toUint8Array(input);
	const { password, maxPages, signal } = options;
	const targetDpi = options.targetDpi ?? DEFAULT_TARGET_DPI;
	const scale = Math.max(targetDpi / POINTS_PER_INCH, 0.1);

	return await withPdfDocument(
		bytes,
		{ password, signal },
		async (document): Promise<PdfImageRenderResult> => {
			const totalPages = document.getPageCount();
			const limit = calculatePageLimit(totalPages, maxPages);
			const pages: PdfImagePage[] = [];

			for (let index = 0; index < limit; index += 1) {
				assertNotAborted(signal);
				const page = document.getPage(index);
				let renderResult: PDFiumPageRender | null = null;
				try {
					renderResult = await page.render({
						scale,
						renderFormFields: options.renderFormFields ?? true,
						render: async ({ data, width, height }) => {
							return await encodeRgbaToPng(
								new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
								width,
								height,
							);
						},
					});
					markPdfiumPageClosed(page);

					pages.push({
						pageNumber: page.number + 1,
						width: renderResult.width,
						height: renderResult.height,
						png: renderResult.data,
					});
				} finally {
					if (renderResult !== null) {
						destroyPdfiumRenderResult(renderResult);
					}
					destroyPdfiumPage(page);
				}
			}

			return { totalPages, pages };
		},
	);
}

async function encodeRgbaToPng(
	rgba: Uint8Array,
	width: number,
	height: number,
): Promise<Uint8Array> {
	const png = new PNG({
		width,
		height,
		inputHasAlpha: true,
		colorType: 6,
	});
	png.data.set(rgba);
	const chunks: Buffer[] = [];
	await new Promise<void>((resolve, reject) => {
		png
			.pack()
			.on("data", (chunk: Buffer) => {
				chunks.push(chunk);
			})
			.once("end", () => {
				resolve();
			})
			.once("error", (error) => {
				reject(error);
			});
	});
	const buffer = Buffer.concat(chunks);
	// Return a Uint8Array view over the Buffer's memory without copying
	return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function calculatePageLimit(totalPages: number, maxPages?: number): number {
	if (!maxPages || maxPages <= 0) {
		return totalPages;
	}
	return Math.min(totalPages, maxPages);
}

type PdfiumModuleInternals = {
	_FPDF_ClosePage?: (pagePtr: number) => void;
	_FORM_OnBeforeClosePage?: (pagePtr: number, formPtr: number) => void;
};

type PdfiumDocumentInternals = {
	module?: PdfiumModuleInternals;
	formIdx?: number | null;
};

type PdfiumPageInternals = {
	destroy?: () => void;
	pageIdx?: number;
	document?: PdfiumDocumentInternals;
};

type PdfiumRenderInternals = {
	destroy?: () => void;
};

const closedPdfiumPages = new WeakSet<PDFiumPage>();

function markPdfiumPageClosed(page: PDFiumPage): void {
	closedPdfiumPages.add(page);
}

function destroyPdfiumPage(page: PDFiumPage): void {
	if (closedPdfiumPages.has(page)) {
		return;
	}

	const candidate = page as unknown as PdfiumPageInternals;
	if (typeof candidate.destroy === "function") {
		try {
			candidate.destroy();
		} catch {
			// Ignore cleanup failures; the page is already being torn down.
		}
		closedPdfiumPages.add(page);
		return;
	}

	const pageIdx = candidate.pageIdx;
	const document = candidate.document;
	const module = document?.module;
	if (
		typeof pageIdx !== "number" ||
		!module ||
		typeof module._FPDF_ClosePage !== "function"
	) {
		return;
	}

	if (
		document &&
		typeof document.formIdx === "number" &&
		typeof module._FORM_OnBeforeClosePage === "function"
	) {
		try {
			module._FORM_OnBeforeClosePage(pageIdx, document.formIdx);
		} catch {
			// Ignore cleanup failures; the form hooks are best-effort.
		}
	}

	try {
		module._FPDF_ClosePage(pageIdx);
		closedPdfiumPages.add(page);
	} catch {
		// Ignore cleanup failures; the page pointer may already be closed.
	}
}

function destroyPdfiumRenderResult(result: PDFiumPageRender): void {
	const candidate = result as unknown as PdfiumRenderInternals;
	if (typeof candidate.destroy === "function") {
		try {
			candidate.destroy();
		} catch {
			// Ignore cleanup failures; rendering buffers have already been released.
		}
	}
}
