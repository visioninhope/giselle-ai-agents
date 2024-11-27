import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const getGitInfo = () => {
	const tag = execSync("git describe --tags").toString().trim();
	const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
	return {
		tag,
		branch,
		buildTime: new Date().toISOString(),
	};
};

const versionInfo = getGitInfo();
const content = `// This file is auto-generated. Do not edit.
export const versionInfo = ${JSON.stringify(versionInfo, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), "version.ts"), content);
