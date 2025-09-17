import { EMBEDDING_PROFILES } from "@giselle-sdk/data-type";

// Document Vector Store UI embedding profiles
// - Only Cohere is selectable
export const DOCUMENT_EMBEDDING_PROFILES = Object.fromEntries(
	Object.entries(EMBEDDING_PROFILES).filter(
		([, profile]) => profile.provider === "cohere",
	),
) as typeof EMBEDDING_PROFILES;
