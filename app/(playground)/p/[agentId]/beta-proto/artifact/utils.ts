function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}
