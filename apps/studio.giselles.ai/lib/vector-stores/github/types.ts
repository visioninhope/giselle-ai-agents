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
 * Schema for content metadata
 */
const blobMetadataSchema = z.object({
	lastIngestedCommitSha: z.string().optional(),
});
const pullRequestMetadataSchema = z.object({
	lastIngestedPrNumber: z.number().optional(),
});

/**
 * Mapping from database content_type (snake_case) to TypeScript keys (camelCase)
 */
const contentTypeToSchemaKeyMap = {
	blob: "blob",
	pull_request: "pullRequest",
} as const satisfies Record<GitHubRepositoryContentType, string>;

/**
 * Metadata schema map for each content type
 */
const metadataSchemaMap = {
	blob: blobMetadataSchema,
	pullRequest: pullRequestMetadataSchema,
} as const;

type ContentMetadataMap = {
	blob: z.infer<typeof blobMetadataSchema>;
	pullRequest: z.infer<typeof pullRequestMetadataSchema>;
};

export type ContentStatusMetadata =
	| ContentMetadataMap[keyof ContentMetadataMap]
	| null;

type ContentMetadataFor<T extends GitHubRepositoryContentType> =
	T extends keyof typeof contentTypeToSchemaKeyMap
		? (typeof contentTypeToSchemaKeyMap)[T] extends keyof ContentMetadataMap
			? ContentMetadataMap[(typeof contentTypeToSchemaKeyMap)[T]]
			: never
		: never;

export function safeParseContentStatusMetadata<
	T extends GitHubRepositoryContentType,
>(
	metadata: unknown,
	contentType: T,
):
	| { success: true; data: ContentMetadataFor<T> | null }
	| { success: false; error: string } {
	if (metadata === null || metadata === undefined) {
		return { success: true, data: null };
	}

	// Map database content_type to schema key (camelCase)
	const schemaKey = contentTypeToSchemaKeyMap[contentType];
	if (!schemaKey) {
		return {
			success: false,
			error: `No schema key mapping defined for content type: ${contentType}`,
		};
	}

	// Get the appropriate schema for the content type
	const schema = metadataSchemaMap[schemaKey as keyof typeof metadataSchemaMap];

	if (!schema) {
		return {
			success: false,
			error: `No metadata schema defined for content type: ${contentType}`,
		};
	}

	const result = schema.safeParse(metadata);

	if (result.success) {
		return { success: true, data: result.data as ContentMetadataFor<T> };
	} else {
		return { success: false, error: result.error.message };
	}
}

type BlobContentMetadata = z.infer<typeof blobMetadataSchema>;
type PullRequestContentMetadata = z.infer<typeof pullRequestMetadataSchema>;

export function createBlobContentMetadata(
	data: BlobContentMetadata,
): ContentMetadataFor<"blob"> {
	return blobMetadataSchema.parse(data);
}

export function createPullRequestContentMetadata(
	data: PullRequestContentMetadata,
): ContentMetadataFor<"pull_request"> {
	return pullRequestMetadataSchema.parse(data);
}
