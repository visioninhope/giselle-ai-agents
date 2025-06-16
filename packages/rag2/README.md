# @giselle-sdk/rag2

A RAG (Retrieval-Augmented Generation) system built with TypeScript, PostgreSQL,
and pgvector.

## Features

### Query Service

- **Vector similarity search** with PostgreSQL + pgvector
- **Type-safe queries** with full TypeScript support and Zod validation
- **Flexible filtering** with context-to-filter mapping
- **Connection pooling** for production performance
- **Comprehensive error handling** with structured error types

## Installation

This package is intended for internal use within the Giselle monorepo.

## Usage

### Query Service

Search through vector embeddings with type-safe metadata filtering.

```typescript
import { createQueryService } from "@giselle-sdk/rag2";
import { z } from "zod/v4";

// Define your metadata schema
const DocumentSchema = z.object({
  repositoryId: z.string(),
  filePath: z.string(),
  commitSha: z.string(),
});

type DocumentMetadata = z.infer<typeof DocumentSchema>;

// Create query service
const queryService = createQueryService<
  { repository: string; owner: string },
  DocumentMetadata
>({
  database: {
    connectionString: process.env.DATABASE_URL!,
    poolConfig: { max: 20 },
  },
  tableName: "document_embeddings",
  contextToFilter: async (context) => ({
    repository_id: `${context.owner}/${context.repository}`,
  }),
  metadataSchema: DocumentSchema,
});

// Search for relevant content
const results = await queryService.search(
  "function authentication",
  { repository: "myapp", owner: "myorg" },
  10,
);

results.forEach((result) => {
  console.log(`Similarity: ${result.similarity.toFixed(3)}`);
  console.log(`File: ${result.metadata.filePath}`);
  console.log(`Content: ${result.chunk.content.substring(0, 100)}...`);
});
```

## API

### Query Service

The query service returns an array of `QueryResult` objects:

```typescript
interface QueryResult<TMetadata> {
  chunk: {
    documentKey: string;
    content: string;
    index: number;
  };
  similarity: number;
  metadata: TMetadata;
}
```

### Factory Functions

- `createQueryService<TContext, TMetadata>(config)` - Creates a new query
  service
- `createDefaultEmbedder()` - Creates OpenAI embedder with default settings
- `createColumnMapping(options)` - Creates database column mapping

## Environment Variables

- `OPENAI_API_KEY`: Required for the default OpenAI embedder
- `DATABASE_URL`: PostgreSQL connection string with pgvector extension

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