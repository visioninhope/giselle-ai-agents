"use client";

import type { FC } from "react";
import { signOut } from "../../actions/sign-out";

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
