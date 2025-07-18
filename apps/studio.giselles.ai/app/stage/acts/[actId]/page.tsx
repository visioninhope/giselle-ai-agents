import type { FlowRunId } from "@giselle-sdk/giselle-engine";

/** ActId is a string with 'flrn-' removed from FlowRunId. */
type ActId = string;
function actIdToFlowRunId(actId: ActId): FlowRunId {
	return `flrn-${actId}`;
}

export default async function ({
	params,
}: {
	params: Promise<{ actId: string }>;
}) {
	const { actId } = await params;
	return (
		<div>
			<h1>Act ID: {actId}</h1>
		</div>
	);
}
