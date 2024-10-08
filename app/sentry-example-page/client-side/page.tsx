"use client";

import React from "react";

export default function DebugErrorPage() {
	return (
		<div>
			<h1>Client-Side Exception Example</h1>
			<button
				type="button"
				onClick={() => {
					throw new Error("Client-Side Exception Example");
				}}
			>
				Throw Exception
			</button>
		</div>
	);
}
