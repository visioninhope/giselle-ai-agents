export interface Command {
	callSign: CallSign;
	instruction: string;
}

export function parseCommand(text: string) {
	const lines = text.trim().split("\n");

	const commandLine = lines[0];
	const commandMatch = commandLine.match(/^\/giselle\s+([^\]]+)/);
	if (!commandMatch) {
		return null;
	}

	return {
		callSign: commandMatch[1],
		content: lines.slice(1).join("\n").trim(),
	};
}
