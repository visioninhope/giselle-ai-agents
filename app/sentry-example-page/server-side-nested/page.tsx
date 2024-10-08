import React from "react";
import ServerError from "./server-error";

export const dynamic = "force-dynamic";

export default async function DebugErrorPage() {
	return (
		<div>
			<h1>Server-Side Exception Example</h1>
			<ServerError hoge="foo" />
		</div>
	);
}
