# @giselle-sdk/web-search

A TypeScript library for scraping and extracting web page content as HTML and Markdown. Supports multiple providers, including Firecrawl (API-based) and a self-made (fetch + Turndown) implementation.

## Features
- Scrape web pages and extract content as HTML and/or Markdown
- Two providers:
  - **Firecrawl**: Uses the [@mendable/firecrawl-js](https://www.npmjs.com/package/@mendable/firecrawl-js) API
  - **SelfMade**: Uses native fetch and [Turndown](https://www.npmjs.com/package/turndown) for HTML-to-Markdown conversion
- Type-safe API using [zod](https://www.npmjs.com/package/zod)

## Installation

This package is intended for internal use within the Giselle monorepo. If you want to use it elsewhere, install dependencies:

```sh
pnpm install
```

## Usage

### Firecrawl Provider

Requires a Firecrawl API key (`FIRECRAWL_API_KEY` environment variable).

```ts
import { firecrawlScrapeUrl } from "@giselle-sdk/web-search";

const result = await firecrawlScrapeUrl("https://example.com", ["html", "markdown"]);
console.log(result.html);      // HTML content
console.log(result.markdown);  // Markdown content
```

### SelfMade Provider

No API key required. Uses fetch and Turndown to convert HTML to Markdown.

```ts
import { selfMadeScrapeUrl } from "@giselle-sdk/web-search";

const result = await selfMadeScrapeUrl("https://example.com", ["html", "markdown"]);
console.log(result.html);      // HTML content
console.log(result.markdown);  // Markdown content
```

## API

Both providers return an object:

```ts
{
  url: string;
  title: string;
  html: string;
  markdown: string;
}
```

- The `formats` argument is an array: `["html", "markdown"]`, `["html"]`, or `["markdown"]`.

## Environment Variables

- `FIRECRAWL_API_KEY`: Required for Firecrawl provider.
- `VITEST_WITH_EXTERNAL_API=1`: (For testing) Enables tests that call the Firecrawl API.

## Development

- **Build:** `pnpm build`
- **Type Check:** `pnpm check-types`
- **Format:** `pnpm format`
- **Test:** `pnpm test`
- **Clean:** `pnpm clean`

## Testing

Uses [Vitest](https://vitest.dev/):

```sh
pnpm test
```

To run tests that require the Firecrawl API, set the environment variable:

```sh
FIRECRAWL_API_KEY=your-key VITEST_WITH_EXTERNAL_API=1 pnpm test
```
