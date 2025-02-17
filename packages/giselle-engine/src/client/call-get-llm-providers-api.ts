import { getLLMProviders } from "../core/schema";

export async function callGetLLMProvidersApi({
	api = getLLMProviders.defaultApi,
}: {
	api?: string;
	host?: string;
}) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const json = await response.json();
	return getLLMProviders.Output.parse(json);
}
