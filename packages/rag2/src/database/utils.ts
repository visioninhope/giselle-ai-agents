import type { z } from "zod/v4";
import type { ColumnMapping, RequiredColumns } from "./types";
import { REQUIRED_COLUMN_KEYS } from "./types";

/**
 * Default mapping for required columns
 */
const DEFAULT_REQUIRED_COLUMNS: RequiredColumns = {
	documentKey: "document_key",
	chunkContent: "chunk_content",
	chunkIndex: "chunk_index",
	embedding: "embedding",
} as const;

/**
 * Convert string to snake_case
 */
function toSnakeCase(str: string): string {
	return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * type guard: check if ZodType has shape property
 */
function hasShapeProperty<T>(
	schema: z.ZodType<T>,
): schema is z.ZodType<T> & { shape: z.ZodRawShape } {
	if (!("shape" in schema)) {
		return false;
	}
	const schemaWithShape = schema as unknown as { shape?: unknown };
	return (
		typeof schemaWithShape.shape === "object" && schemaWithShape.shape !== null
	);
}

/**
 * validate column mapping
 */
function validateColumnMapping<TMetadata>(
	mapping: Record<string, string>,
	metadataSchema?: z.ZodType<TMetadata>,
): mapping is ColumnMapping<TMetadata> {
	// ensure all required column keys are present
	for (const key of REQUIRED_COLUMN_KEYS) {
		if (!(key in mapping)) {
			return false;
		}
	}

	// if metadataSchema is provided, ensure all metadata fields are included
	if (metadataSchema && hasShapeProperty(metadataSchema)) {
		const shape = metadataSchema.shape;
		const metadataKeys = Object.keys(shape);
		for (const key of metadataKeys) {
			if (!(key in mapping)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * create column mapping
 * convert metadata field names to snake_case as default database column names
 */
export function createColumnMapping<TSchema extends z.ZodTypeAny>(options: {
	metadataSchema: TSchema;
	requiredColumnOverrides?: Partial<RequiredColumns>;
	metadataColumnOverrides?: Partial<Record<keyof z.infer<TSchema>, string>>;
}): ColumnMapping<z.infer<TSchema>> {
	const { metadataSchema, requiredColumnOverrides, metadataColumnOverrides } =
		options;

	// set required columns
	const requiredColumns: RequiredColumns = {
		...DEFAULT_REQUIRED_COLUMNS,
		...requiredColumnOverrides,
	};

	// build metadata columns step by step
	const metadataColumns: Record<string, string> = {};

	if (metadataSchema && hasShapeProperty(metadataSchema)) {
		// if metadataSchema is a ZodObject, generate column names from field names
		const shape = metadataSchema.shape;
		const fieldNames = Object.keys(shape);

		for (const fieldName of fieldNames) {
			// type safe key access
			const customMapping =
				metadataColumnOverrides?.[fieldName as keyof z.infer<TSchema>];
			if (customMapping) {
				// if custom mapping is specified
				metadataColumns[fieldName] = customMapping;
			} else if (!metadataColumns[fieldName]) {
				// if preset is not specified and custom mapping is not specified, convert to snake_case
				metadataColumns[fieldName] = toSnakeCase(fieldName);
			}
		}
	}

	// build result
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
