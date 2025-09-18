import { Buffer } from "node:buffer";

import { type PDFiumDocument, PDFiumLibrary } from "@hyzyla/pdfium";
import { PDFIUM_WASM_BASE64 } from "@hyzyla/pdfium/dist/pdfium.wasm.base64-B4io7kt4.js";

import { assertNotAborted } from "./abort.js";

let pdfiumLibraryPromise: Promise<PDFiumLibrary> | null = null;

let _pdfiumWasmBinary: ArrayBuffer | null = null;
function getPdfiumWasmBinary(): ArrayBuffer {
	if (_pdfiumWasmBinary === null) {
		_pdfiumWasmBinary = decodeBase64ToArrayBuffer(PDFIUM_WASM_BASE64);
	}
	return _pdfiumWasmBinary;
}

function createPdfiumLibrary(): Promise<PDFiumLibrary> {
	return PDFiumLibrary.init({ wasmBinary: getPdfiumWasmBinary() });
}

export function getPdfiumLibrary(): Promise<PDFiumLibrary> {
	if (pdfiumLibraryPromise === null) {
		pdfiumLibraryPromise = createPdfiumLibrary();
	}
	return pdfiumLibraryPromise;
}

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
	const buffer = Buffer.from(base64, "base64");
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	);
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
