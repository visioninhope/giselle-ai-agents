import React from "react";

export default async function ServerError({ hoge }: { hoge: string }) {
	const data = await fetch("http://localhost:3000/api/error").then((res) =>
		res.json(),
	);
	console.log(data);
	return (
		<div>
			<h1>Server-Side Exception Example</h1>
			{hoge}
		</div>
	);
}
