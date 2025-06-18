import type { PoolClient } from "pg";
import * as pgvector from "pgvector/pg";

/**
 * Module-level state for pgvector type registration to avoid redundant calls
 * and improve performance across database operations.
 */
const registeredPools = new Set<string>();

/**
 * Create a consistent identifier for a connection pool
 * This normalizes the connection string to handle minor variations
 */
function createPoolIdentifier(connectionString: string): string {
	try {
		const url = new URL(connectionString);
		// Use host, port, and database as the identifier
		// This avoids credentials in the identifier while maintaining uniqueness
		return `${url.hostname}:${url.port || 5432}/${url.pathname.slice(1)}`;
	} catch {
		// Fallback for non-URL connection strings
		return connectionString;
	}
}

/**
 * Ensure pgvector types are registered for the given connection.
 * Uses connection string as identifier to avoid duplicate registrations.
 *
 * @param client - PostgreSQL client connection
 * @param connectionString - Database connection string for identification
 */
export async function ensurePgVectorTypes(
	client: PoolClient,
	connectionString: string,
): Promise<void> {
	// Create a unique identifier for this connection pool
	const poolIdentifier = createPoolIdentifier(connectionString);

	if (!registeredPools.has(poolIdentifier)) {
		await pgvector.registerTypes(client);
		registeredPools.add(poolIdentifier);
	}
}

/**
 * Clear the pgvector registration cache (for testing)
 */
export function clearPgVectorCache(): void {
	registeredPools.clear();
}

/**
 * @deprecated Use module-level functions instead
 * Singleton registry for pgvector type registration
 */
class PgVectorRegistry {
	private static instance: PgVectorRegistry;
	private registeredPools = new Set<string>();

	private constructor() {}

	/**
	 * @deprecated Use ensurePgVectorTypes function instead
	 */
	static getInstance(): PgVectorRegistry {
		if (!PgVectorRegistry.instance) {
			PgVectorRegistry.instance = new PgVectorRegistry();
		}
		return PgVectorRegistry.instance;
	}

	/**
	 * @deprecated Use ensurePgVectorTypes function instead
	 */
	async ensureRegistered(
		client: PoolClient,
		connectionString: string,
	): Promise<void> {
		await ensurePgVectorTypes(client, connectionString);
	}

	/**
	 * @deprecated Use clearPgVectorCache function instead
	 */
	clearCache(): void {
		clearPgVectorCache();
	}
}
