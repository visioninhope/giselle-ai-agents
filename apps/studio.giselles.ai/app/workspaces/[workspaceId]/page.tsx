import { layoutV2Flag } from "@/flags";
import { Editor, Header } from "@giselle-internal/workflow-designer-ui";
import { updateAgentName } from "./actions";

export default async function Page() {
	const layoutV2 = await layoutV2Flag();
	return (
		<div className="flex flex-col h-screen bg-black-900">
			{!layoutV2 && <Header onWorkflowNameChange={updateAgentName} />}
			<Editor />
		</div>
	);
}
