import {
	firecrawlProviderName,
	scrapeUrl as firecrawlScrapeUrl,
} from "./firecrawl";
import {
	type selfMadeProviderName,
	scrapeUrl as selfMadeScrapeUrl,
} from "./self-made";

export type AllowedFormats = "html" | "markdown";

export interface WebSearchConfigFirecrawl {
	provider: typeof firecrawlProviderName;
	apiKey?: string;
}

export interface WebSearchConfigSelfMade {
	provider: typeof selfMadeProviderName;
}

export type WebSearchConfig =
	| WebSearchConfigFirecrawl
	| WebSearchConfigSelfMade;

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

export function webSearch(config: WebSearchConfig): WebSearchTool {
	if (config.provider === firecrawlProviderName) {
		return {
			fetchUrl: (url: string, formats?: AllowedFormats[]) =>
				firecrawlScrapeUrl(url, config.apiKey ?? "", formats),
		};
	}
	return {
		fetchUrl: (url: string, formats?: AllowedFormats[]) =>
			selfMadeScrapeUrl(url, formats),
	};
}
