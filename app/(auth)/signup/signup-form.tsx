"use client";

import { type FC, useActionState } from "react";
import { Form } from "../components";
import { signup } from "./signup";

export const SignupForm: FC = () => {
	const [authError, action] = useActionState(signup, null);
	return (
		<form action={action}>
			<Form submitText="Create an account" authError={authError} />
		</form>
	);
};
