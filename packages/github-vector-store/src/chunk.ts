/**
 * Split document string into chunks by lines
 * @param src - document string
 * @param maxLines - 1 chunk line limit
 * @param overlap - line overlap
 */
export function chunkByLines(src: string, maxLines = 150, overlap = 30) {
	const lines = src.split(/\r?\n/);
	const chunks: string[] = [];
	for (let i = 0; i < lines.length; i += maxLines - overlap) {
		chunks.push(lines.slice(i, i + maxLines).join("\n"));
	}
	return chunks;
}
