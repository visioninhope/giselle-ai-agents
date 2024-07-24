import { Canvas } from "@/app/agents/canvas";
import { getRequest } from "@/app/agents/requests";
import { RequestProvider } from "@/app/agents/requests/contexts";

export default async function Page({
	params,
}: { params: { requestId: string } }) {
	const request = await getRequest(Number.parseInt(params.requestId, 10));
	console.log(JSON.stringify(request, null, 2));
	return (
		<RequestProvider request={request}>
			<Canvas />
		</RequestProvider>
	);
}
