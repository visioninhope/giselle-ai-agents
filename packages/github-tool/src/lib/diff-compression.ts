export interface FileDiff {
	fileName: string;
	content: string;
	size: number;
	header: string;
}

export function compressLargeDiff(diff: string, maxSize = 8000): string {
	if (diff.length <= maxSize) {
		return diff;
	}

	const fileDiffs = parseFileDiffs(diff);

	fileDiffs.sort((a, b) => b.size - a.size);
	const totalHeaderSize = fileDiffs.reduce((sum, file) => {
		const headerSize = file.content
			.split("\n")
			.filter((line) => isHeaderLine(line))
			.join("\n").length;
		return sum + headerSize;
	}, 0);

	const availableForContent = maxSize - totalHeaderSize;
	const totalContentSize =
		fileDiffs.reduce((sum, file) => sum + file.size, 0) - totalHeaderSize;
	const compressionRatio = Math.min(1, availableForContent / totalContentSize);

	const compressedFiles = fileDiffs.map((file) => {
		const headerSize = file.content
			.split("\n")
			.filter((line) => isHeaderLine(line))
			.join("\n").length;
		const contentSize = file.size - headerSize;
		const targetContentSize = Math.floor(contentSize * compressionRatio);
		const targetTotalSize = headerSize + targetContentSize;

		return compressFileDiff(file, targetTotalSize);
	});

	return compressedFiles.join("\n");
}

function parseFileDiffs(diff: string): FileDiff[] {
	const lines = diff.split("\n");
	const fileDiffs: FileDiff[] = [];
	let currentFile: FileDiff | null = null;

	for (const line of lines) {
		if (line.startsWith("diff --git")) {
			if (currentFile) {
				fileDiffs.push(currentFile);
			}

			const fileName = extractFileName(line);
			currentFile = {
				fileName,
				content: `${line}\n`,
				size: line.length + 1,
				header: line,
			};
		} else if (currentFile) {
			currentFile.content += `${line}\n`;
			currentFile.size += line.length + 1;
		}
	}

	if (currentFile) {
		fileDiffs.push(currentFile);
	}

	return fileDiffs;
}

function compressFileDiff(fileDiff: FileDiff, targetSize: number): string {
	if (fileDiff.size <= targetSize) {
		return fileDiff.content.trim();
	}

	const lines = fileDiff.content.split("\n");
	let result = "";
	let currentSize = 0;

	const headerLines: string[] = [];
	const contentLines: string[] = [];

	for (const line of lines) {
		if (isHeaderLine(line)) {
			headerLines.push(line);
		} else {
			contentLines.push(line);
		}
	}

	const headerContent = `${headerLines.join("\n")}\n`;
	result = headerContent;
	currentSize = headerContent.length;

	const remainingSize = targetSize - currentSize - 4;
	let contentAdded = "";

	for (const line of contentLines) {
		const lineWithNewline = `${line}\n`;
		if (currentSize + lineWithNewline.length <= remainingSize) {
			contentAdded += lineWithNewline;
			currentSize += lineWithNewline.length;
		} else {
			break;
		}
	}

	result += contentAdded;

	if (contentLines.length > contentAdded.split("\n").length - 1) {
		result += "...\n";
	}

	return result.trim();
}

function isHeaderLine(line: string): boolean {
	return (
		line.startsWith("diff --git") ||
		line.startsWith("index ") ||
		line.startsWith("+++") ||
		line.startsWith("---") ||
		line.startsWith("@@") ||
		line.match(/^new file mode/) !== null ||
		line.match(/^deleted file mode/) !== null
	);
}

function extractFileName(diffLine: string): string {
	const match = diffLine.match(/diff --git a\/(.+?) b\//);
	return match ? match[1] : "unknown";
}
