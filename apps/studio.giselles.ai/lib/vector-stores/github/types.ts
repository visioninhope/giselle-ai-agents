import { z } from "zod/v4";
import type {
	GitHubRepositoryContentType,
	githubRepositoryContentStatus,
	githubRepositoryIndex,
} from "@/drizzle/schema";

/**
 * Repository with all its content statuses
 */
export type RepositoryWithStatuses = {
	repositoryIndex: typeof githubRepositoryIndex.$inferSelect;
	contentStatuses: (typeof githubRepositoryContentStatus.$inferSelect)[];
};

/**
 * Content status metadata schemas
 */
const blobMetadataSchema = z.object({
	lastIngestedCommitSha: z.string().optional(),
});

const pullRequestMetadataSchema = z.object({
	lastIngestedPrNumber: z.number().optional(),
});

/**
 * Content status metadata types
 */
export type BlobMetadata = z.infer<typeof blobMetadataSchema>;
export type PullRequestMetadata = z.infer<typeof pullRequestMetadataSchema>;

/**
 * Union type for all metadata
 */
export type ContentStatusMetadata = BlobMetadata | PullRequestMetadata | null;

/**
 * Map content type to metadata schema
 */
const METADATA_SCHEMAS = {
	blob: blobMetadataSchema,
	pull_request: pullRequestMetadataSchema,
} as const;

/**
 * Helper type for metadata based on content type
 */
type MetadataForContentType<T extends GitHubRepositoryContentType> =
	T extends "blob"
		? BlobMetadata
		: T extends "pull_request"
			? PullRequestMetadata
			: never;

/**
 * Type-safe metadata getter
 */
export function getContentStatusMetadata<T extends GitHubRepositoryContentType>(
	metadata: unknown,
	contentType: T,
): MetadataForContentType<T> | null {
	if (!metadata) {
		return null;
	}

	const schema = METADATA_SCHEMAS[contentType];
	const parsed = schema.safeParse(metadata);

	return parsed.success ? (parsed.data as MetadataForContentType<T>) : null;
}

/**
 * Type-safe metadata creators
 */
export function createBlobMetadata(data: BlobMetadata): BlobMetadata {
	return blobMetadataSchema.parse(data);
}

export function createPullRequestMetadata(
	data: PullRequestMetadata,
): PullRequestMetadata {
	return pullRequestMetadataSchema.parse(data);
}
