import { z } from "zod/v4";
import type { ColumnMapping, RequiredColumns } from "./types";
import { REQUIRED_COLUMN_KEYS } from "./types";

const DEFAULT_REQUIRED_COLUMNS: RequiredColumns = {
	documentKey: "document_key",
	chunkContent: "chunk_content",
	chunkIndex: "chunk_index",
	embedding: "embedding",
} as const;

function toSnakeCase(str: string): string {
	return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Get keys from a Zod schema if it's an object schema
 */
function getSchemaKeys(schema: z.ZodType<unknown>): string[] {
	if (schema instanceof z.ZodObject) {
		return Object.keys(schema.shape);
	}
	return [];
}

/**
 * validate column mapping
 */
function validateColumnMapping<TMetadata>(
	mapping: Record<string, string>,
	metadataSchema: z.ZodType<TMetadata>,
): mapping is ColumnMapping<TMetadata> {
	// ensure all required column keys are present
	for (const key of REQUIRED_COLUMN_KEYS) {
		if (!(key in mapping)) {
			return false;
		}
	}

	// ensure all metadata fields are included
	const metadataKeys = getSchemaKeys(metadataSchema);
	for (const key of metadataKeys) {
		if (!(key in mapping)) {
			return false;
		}
	}

	return true;
}

/**
 * create column mapping
 * convert metadata field names to snake_case as default database column names
 */
export function createColumnMapping<
	TSchema extends z.ZodType<Record<string, unknown>>,
>(options: {
	metadataSchema: TSchema;
	requiredColumnOverrides?: Partial<RequiredColumns>;
	metadataColumnOverrides?: Partial<Record<keyof z.infer<TSchema>, string>>;
}): ColumnMapping<z.infer<TSchema>> {
	const { metadataSchema, requiredColumnOverrides, metadataColumnOverrides } =
		options;

	const requiredColumns: RequiredColumns = {
		...DEFAULT_REQUIRED_COLUMNS,
		...requiredColumnOverrides,
	};

	const metadataColumns: Record<string, string> = {};
	const fieldNames = getSchemaKeys(metadataSchema);

	for (const fieldName of fieldNames) {
		const customMapping =
			metadataColumnOverrides?.[fieldName as keyof z.infer<TSchema>];
		if (customMapping) {
			metadataColumns[fieldName] = customMapping;
		} else if (!metadataColumns[fieldName]) {
			metadataColumns[fieldName] = toSnakeCase(fieldName);
		}
	}

	const result: RequiredColumns & Record<string, string> = {
		...requiredColumns,
		...metadataColumns,
	};

	// Runtime validation ensures type safety
	if (!validateColumnMapping(result, metadataSchema)) {
		throw new Error(
			"Failed to create valid ColumnMapping: missing required columns or metadata fields",
		);
	}
	// Now we can safely return the validated result
	return result as ColumnMapping<z.infer<TSchema>>;
}
