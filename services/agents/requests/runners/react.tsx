import type { FC } from "react";
import type { Request } from "../types";

type RequestRunnerProps = {
	request: Request;
};
export const RequestRunner: FC<RequestRunnerProps> = ({ request }) => {
	return (
		<div>
			<h1>Request Runner</h1>
			<p>Request: {request.id}</p>
		</div>
	);
};
