const fs = require("node:fs").promises;

const fileNames = [
	"Rosart-Regular",
	"Rosart-RegularItalic",
	"Rosart-Medium",
	"Rosart-SemiBold",
	"Rosart-Bold",
];

const downloadFile = async (url, destination) => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();

	await fs.writeFile(destination, Buffer.from(buffer));
};

(async () => {
	// TODO: 一旦 preview 用にコメントアウト
	// if (process.env.NODE_ENV === "production") {

	const BLOB_URL = process.env.BLOB_URL;

	if (!BLOB_URL) {
		console.error("BLOB_URL is not defined");
		return;
	}

	const filesToDownload = fileNames.map((fileName) => ({
		url: `${BLOB_URL}/fonts/${fileName}.woff2`,
		destination: `./app/fonts/${fileName}.woff2`,
	}));

	for (const file of filesToDownload) {
		try {
			await downloadFile(file.url, file.destination);
			console.log(`Downloaded: ${file.destination}`);
		} catch (error) {
			console.error(`Error downloading ${file.url}:`, error);
		}
	}
	// } else {
	//  console.log("Skipping download in non-production environment");
	// }
})();
