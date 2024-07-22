import { unstable_cache } from "next/cache";
import type { FC } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getCachedUser = unstable_cache(async (id) => sleep(id), ["my-app-user"], {
	tags: ["get-user"],
});
export const ServerComponent: FC = async () => {
	await getCachedUser(5000);
	return <div>{new Date().toUTCString()}</div>;
};
