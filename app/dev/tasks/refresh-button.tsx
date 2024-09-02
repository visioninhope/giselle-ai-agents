"use client";

import { useRouter } from "next/navigation";
import type { FC } from "react";

export const RefreshButton: FC = () => {
	const router = useRouter();
	return (
		<button onClick={() => router.refresh()} type="button">
			Refresh
		</button>
	);
};
