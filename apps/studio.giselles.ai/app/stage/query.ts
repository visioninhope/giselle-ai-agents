import { getAccountInfo } from "../(main)/settings/account/actions";

export async function getSidebarData() {
	const accountInfo = await getAccountInfo();
	return {
		displayName: accountInfo.displayName ?? undefined,
		email: accountInfo.email ?? undefined,
		avatarUrl: accountInfo.avatarUrl ?? undefined,
	};
}
