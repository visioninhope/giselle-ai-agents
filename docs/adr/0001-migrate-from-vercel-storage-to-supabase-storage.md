# ADR-0001: Migrate from Vercel Storage to Supabase Storage

## Status
Accepted

## Context
We need reliable file storage for managing Generation Node states and workflow execution states. The application requires immediate access to updated files after write operations. However, with Vercel Storage, we've been experiencing frequent issues where updated file content isn't retrievable even after disabling caching.

## Decision
We will migrate our application storage from Vercel Storage to Supabase Storage.

## Alternatives Considered
We evaluated several alternatives:
- AWS S3
- Cloudflare R2
- InstantDB and other newer storage services

We chose Supabase Storage for the following reasons:
1. Our current storage needs are simple - primarily JSON and BLOB persistence without requiring advanced features
2. Supabase Storage is compatible with unstorage, which we're already using
3. We're already using Supabase for authentication in studio.giselles.ai

## Implementation
The existing data migration will be handled using the tool available at [`tools/storage-migration`](../../tools/storage-migration).
For more details, please refer to that directory.

## Consequences
### Positive
- More reliable file access immediately after write operations
- Consistent integration with our existing authentication system
- Simplified storage architecture by leveraging an already-used service provider

### Negative
- Migration effort required for existing data
- Potential need to update application code to work with the new storage backend