export function isPdfFile(file: { type?: string; name: string }): boolean {
	if (file.type === "application/pdf") {
		return true;
	}
	return file.name.toLowerCase().endsWith(".pdf");
}
