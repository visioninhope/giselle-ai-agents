"use client";

import { Editor, Header } from "@giselle-internal/workflow-designer-ui";
import { useSearchParams } from "next/navigation";

export default function Page() {
	const searchParams = useSearchParams();

	// Get the readOnly state from URL parameters
	const isReadOnly = searchParams.get("readOnly") === "true";

	// Retrieve role parameter or default to viewer
	const userRole = (searchParams.get("role") || "viewer") as
		| "viewer"
		| "guest"
		| "editor"
		| "owner";

	return (
		<div className="flex flex-col h-screen bg-black-900">
			<Header isReadOnly={isReadOnly} shareFeatureFlag />
			<Editor githubTools isReadOnly={isReadOnly} userRole={userRole} />
		</div>
	);
}
