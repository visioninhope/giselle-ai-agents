type ValidationResult = {
	isValid: boolean;
	error?: string;
};

// Recognized PostgreSQL connection parameters
const RECOGNIZED_PARAMS = new Set([
	"host",
	"hostaddr",
	"port",
	"dbname",
	"user",
	"password",
	"connect_timeout",
	"client_encoding",
	"options",
	"application_name",
	"fallback_application_name",
	"keepalives",
	"keepalives_idle",
	"keepalives_interval",
	"keepalives_count",
	"tcp_user_timeout",
	"sslmode",
	"requiressl",
	"sslcompression",
	"sslcert",
	"sslkey",
	"sslrootcert",
	"sslcrl",
	"requirepeer",
	"krbsrvname",
	"gsslib",
	"service",
	"target_session_attrs",
	"passfile",
	"channel_binding",
	"connect_timeout",
	"tcp_user_timeout",
]);

const SSL_MODES = new Set([
	"disable",
	"allow",
	"prefer",
	"require",
	"verify-ca",
	"verify-full",
]);

// Characters that need percent-encoding in URI components
const SPECIAL_CHARS_REGEX = /[@:#/?&=%\s]/;

export function validatePostgreSQLConnectionString(
	connectionString: string,
): ValidationResult {
	if (!connectionString || connectionString.trim() === "") {
		return { isValid: false, error: "Connection string cannot be empty" };
	}

	const trimmed = connectionString.trim();

	// Check if it's URI format
	if (
		trimmed.startsWith("postgresql://") ||
		trimmed.startsWith("postgres://")
	) {
		return validateURIFormat(trimmed);
	}

	// Otherwise, validate as key-value format
	return validateKeyValueFormat(trimmed);
}

function validateURIFormat(uri: string): ValidationResult {
	try {
		// Basic URI structure validation
		const uriRegex =
			/^(postgresql|postgres):\/\/(?:([^:@]+)(?::([^@]+))?@)?([^:/]+)(?::(\d+))?(?:\/([^?]+))?(?:\?(.+))?$/;
		const match = uri.match(uriRegex);

		if (!match) {
			return {
				isValid: false,
				error:
					"Invalid connection string format. Expected: postgresql://[user[:password]@][host][:port][/database][?options]",
			};
		}

		const [, _scheme, user, password, _host, port, database, params] = match;

		// Validate port if present
		if (
			port &&
			(Number.isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535)
		) {
			return {
				isValid: false,
				error: `The port '${port}' is not a valid number (must be between 1 and 65535)`,
			};
		}

		// Check for unencoded special characters in user
		if (user && SPECIAL_CHARS_REGEX.test(decodeURIComponent(user))) {
			const specialChar = user.match(SPECIAL_CHARS_REGEX)?.[0];
			return {
				isValid: false,
				error: `The username contains a special character ('${specialChar}') that should be percent-encoded to '${encodeURIComponent(specialChar || "")}'`,
			};
		}

		// Check for unencoded special characters in password
		if (password) {
			try {
				const decoded = decodeURIComponent(password);
				// If decoding changes the password, it was already encoded
				if (decoded === password && SPECIAL_CHARS_REGEX.test(password)) {
					const specialChar = password.match(SPECIAL_CHARS_REGEX)?.[0];
					return {
						isValid: false,
						error: `The password contains a special character ('${specialChar}') that should be percent-encoded to '${encodeURIComponent(specialChar || "")}'`,
					};
				}
			} catch {
				// Invalid encoding
				return {
					isValid: false,
					error: "The password contains invalid percent-encoding",
				};
			}
		}

		// Check for unencoded special characters in database name
		if (database && SPECIAL_CHARS_REGEX.test(decodeURIComponent(database))) {
			const specialChar = database.match(SPECIAL_CHARS_REGEX)?.[0];
			return {
				isValid: false,
				error: `The database name contains a special character ('${specialChar}') that should be percent-encoded to '${encodeURIComponent(specialChar || "")}'`,
			};
		}

		// Validate query parameters if present
		if (params) {
			const paramPairs = params.split("&");
			for (const pair of paramPairs) {
				const [key, value] = pair.split("=");
				if (!key || !value) {
					return {
						isValid: false,
						error: `Invalid parameter format: '${pair}'. Expected 'key=value'`,
					};
				}

				const decodedKey = decodeURIComponent(key);
				if (!RECOGNIZED_PARAMS.has(decodedKey)) {
					return {
						isValid: false,
						error: `'${decodedKey}' is not a recognized parameter`,
					};
				}

				// Validate specific parameter values
				if (
					decodedKey === "sslmode" &&
					!SSL_MODES.has(decodeURIComponent(value))
				) {
					return {
						isValid: false,
						error: `Invalid sslmode value '${decodeURIComponent(value)}'. Valid values are: ${Array.from(SSL_MODES).join(", ")}`,
					};
				}

				if (decodedKey === "port") {
					const portNum = Number(decodeURIComponent(value));
					if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
						return {
							isValid: false,
							error: `The port '${decodeURIComponent(value)}' is not a valid number (must be between 1 and 65535)`,
						};
					}
				}
			}
		}

		return { isValid: true };
	} catch (_error) {
		return {
			isValid: false,
			error: "Invalid connection string format",
		};
	}
}

function validateKeyValueFormat(kvString: string): ValidationResult {
	const pairs = kvString.split(/\s+/);

	for (const pair of pairs) {
		if (!pair) continue;

		const equalIndex = pair.indexOf("=");
		if (equalIndex === -1) {
			return {
				isValid: false,
				error: `Invalid format: '${pair}'. Expected 'key=value' pairs separated by spaces`,
			};
		}

		const key = pair.substring(0, equalIndex);
		const value = pair.substring(equalIndex + 1);

		if (!key || !value) {
			return {
				isValid: false,
				error: `Invalid parameter format: '${pair}'. Both key and value are required`,
			};
		}

		// Check if the key is recognized
		if (!RECOGNIZED_PARAMS.has(key)) {
			// Provide helpful suggestion for common mistakes
			if (key === "db") {
				return {
					isValid: false,
					error: `'${key}' is not a recognized keyword. Did you mean 'dbname'?`,
				};
			}
			return {
				isValid: false,
				error: `'${key}' is not a recognized parameter`,
			};
		}

		// Validate specific parameter values
		if (key === "port") {
			const portNum = Number(value);
			if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
				return {
					isValid: false,
					error: `The port '${value}' is not a valid number (must be between 1 and 65535)`,
				};
			}
		}

		if (key === "sslmode" && !SSL_MODES.has(value)) {
			return {
				isValid: false,
				error: `Invalid sslmode value '${value}'. Valid values are: ${Array.from(SSL_MODES).join(", ")}`,
			};
		}

		// Check for special characters that might need escaping in key-value format
		if (value.includes(" ") && !value.startsWith("'") && !value.endsWith("'")) {
			return {
				isValid: false,
				error: `The value for '${key}' contains spaces and should be quoted with single quotes`,
			};
		}
	}

	return { isValid: true };
}
