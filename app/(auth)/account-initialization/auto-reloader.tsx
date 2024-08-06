"use client";

import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";

export const AutoReloader: FC = () => {
	const router = useRouter();
	useEffect(() => {
		const id = setInterval(() => {
			router.refresh();
		}, 1000);
		return () => {
			clearInterval(id);
		};
	}, [router]);
	return null;
};
