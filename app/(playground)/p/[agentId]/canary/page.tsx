import { Editor } from "./components/editor";
import { artifacts, connections, nodes } from "./mockData";
import { createGraphId } from "./utils";

export default function Page() {
	return (
		<Editor graph={{ id: createGraphId(), nodes, connections, artifacts }} />
	);
}
