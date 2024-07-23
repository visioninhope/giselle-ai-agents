import { Canvas } from "@/app/agents/canvas";
import { getRequest } from "@/app/agents/requests";
import { RequestProvider } from "@/app/agents/requests/contexts";

export default async function Page({
	params,
}: { params: { requestId: string } }) {
	const request = await getRequest(params.requestId);
	return (
		<RequestProvider request={request}>
			<Canvas />
		</RequestProvider>
	);
}
