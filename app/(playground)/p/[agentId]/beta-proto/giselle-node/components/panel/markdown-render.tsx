import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";

type MarkdownRenderProps = {
	markdownLike: string;
};
export function MarkdownRender(props: MarkdownRenderProps) {
	const [markdown, setMarkdown] = useState("");
	useEffect(() => {
		console.log(props.markdownLike);
		remark()
			.use(html)
			.process(props.markdownLike)
			.then((parsedContent) => {
				console.log(parsedContent.toString());
				setMarkdown(parsedContent.toString());
			});
	}, [props.markdownLike]);
	console.log(markdown);
	if (markdown === "") {
		return null;
	}

	console.log("here?");

	return (
		<div
			// biome-ignore lint: lint/security/noDangerouslySetInnerHtml
			dangerouslySetInnerHTML={{ __html: markdown }}
			className="prose prose-sm prose-giselle"
		/>
	);
}
