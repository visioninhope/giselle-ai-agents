import type { DocumentLoaderErrorCode } from "@giselle-sdk/rag";

/**
 * Get user-friendly error message from DocumentLoaderError
 */
export function getErrorMessage(code: DocumentLoaderErrorCode): string {
	switch (code) {
		case "DOCUMENT_ACCESS_DENIED":
			return "Access denied to repository. Please check GitHub App permissions.";
		case "DOCUMENT_NOT_FOUND":
			return "We couldn't find this repository. It might be private, deleted, or your Vector Store may need to be reconfigured with proper permissions.";
		case "DOCUMENT_RATE_LIMITED":
			return "GitHub API rate limit reached. Will be processed in the next sync cycle.";
		case "DOCUMENT_TOO_LARGE":
			return "This repository is too large for our current processing capabilities.";
		case "DOCUMENT_FETCH_ERROR":
			return "Failed to fetch repository data. The system will retry automatically.";
		default:
			return "An error occurred while processing the repository.";
	}
}
