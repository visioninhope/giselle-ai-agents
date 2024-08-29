import type { FC } from "react";
import { useRequest } from "../contexts/request-provider";

export const RequestLogger: FC = () => {
	const { lastRequest } = useRequest();

	if (lastRequest == null) {
		return;
	}
	return (
		<div>
			<h1>Request Logger</h1>
			<pre>{JSON.stringify(lastRequest, null, 2)}</pre>
		</div>
	);
};
