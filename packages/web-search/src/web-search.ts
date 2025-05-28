import {
	type selfMadeProviderName,
	scrapeUrl as selfMadeScrapeUrl,
} from "./self-made";

export type AllowedFormats = "html" | "markdown";

export interface WebSearchConfig {
	provider: typeof selfMadeProviderName;
}

export type WebSearchResult = {
	url: string;
	title: string;
	html: string;
	markdown: string;
};

export interface WebSearchTool {
	fetchUrl: (
		url: string,
		formats?: AllowedFormats[],
	) => Promise<WebSearchResult>;
}

export function webSearch(_config: WebSearchConfig): WebSearchTool {
	return {
		fetchUrl: (url: string, formats?: AllowedFormats[]) =>
			selfMadeScrapeUrl(url, formats),
	};
}
