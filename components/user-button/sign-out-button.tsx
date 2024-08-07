"use client";

import { signOut } from "@/app/(auth)";
import type { FC } from "react";

export const SignOutButton: FC = () => {
	return (
		<button
			type="button"
			onClick={() => {
				signOut();
			}}
		>
			Logout
		</button>
	);
};
