"use client";
import { useCompletion } from "ai/react";

export default function Home() {
	const { completion, handleSubmit } = useCompletion({
		api: "/api/workflow/text-generation",
		initialInput: "hello",
		body: { prompt: "hi!" },
	});
	return (
		<main>
			<p>{completion}</p>
			<form onSubmit={handleSubmit}>
				<button type="submit">Hello world!</button>
			</form>
		</main>
	);
}
