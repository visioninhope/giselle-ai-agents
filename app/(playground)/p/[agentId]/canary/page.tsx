import { playgroundV2Flag } from "@/flags";
import { notFound } from "next/navigation";
import { Editor } from "./components/editor";
import { artifacts, connections, nodes } from "./mockData";
import { createGraphId } from "./utils";

// This page is experimental. it requires PlaygroundV2Flag to show this page
export default async function Page() {
	const playgroundV2 = await playgroundV2Flag();
	if (!playgroundV2) {
		return notFound();
	}
	return (
		<Editor graph={{ id: createGraphId(), nodes, connections, artifacts }} />
	);
}
