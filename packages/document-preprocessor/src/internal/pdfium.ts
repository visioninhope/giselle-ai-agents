import { type PDFiumDocument, PDFiumLibrary } from "@hyzyla/pdfium";

import { assertNotAborted } from "./abort.js";

let cachedPdfiumLibrary: PDFiumLibrary | null = null;
let pendingInitialization: Promise<PDFiumLibrary> | null = null;

async function getPdfiumLibrary(): Promise<PDFiumLibrary> {
	if (cachedPdfiumLibrary !== null) {
		return cachedPdfiumLibrary;
	}

	if (pendingInitialization === null) {
		pendingInitialization = PDFiumLibrary.init().then((library) => {
			cachedPdfiumLibrary = library;
			return library;
		});
	}

	return await pendingInitialization;
}

export async function withPdfDocument<T>(
	data: Uint8Array,
	options: { password?: string; signal?: AbortSignal },
	handler: (document: PDFiumDocument) => Promise<T> | T,
): Promise<T> {
	assertNotAborted(options.signal);
	const library = await getPdfiumLibrary();
	assertNotAborted(options.signal);
	const document = await library.loadDocument(data, options.password);
	try {
		assertNotAborted(options.signal);
		return await handler(document);
	} finally {
		document.destroy();
	}
}
