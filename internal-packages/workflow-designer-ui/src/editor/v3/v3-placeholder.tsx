"use client";

export function V3Placeholder({
	isReadOnly = false,
	userRole = "viewer",
}: {
	isReadOnly?: boolean;
	userRole?: "viewer" | "guest" | "editor" | "owner";
}) {
	return <div className="text-text">V3(WIP)</div>;
}
