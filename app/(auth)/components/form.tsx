"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { FC } from "react";
import { useFormState, useFormStatus } from "react-dom";

type FormProps = {
	linkToResetPassword?: boolean;
	submitText?: string;
};
export const Form: FC<FormProps> = ({
	linkToResetPassword = false,
	submitText = "Submit",
}) => {
	const { pending } = useFormStatus();
	return (
		<div className="grid gap-4">
			<div className="grid gap-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" name="email" required />
			</div>
			<div className="grid gap-2">
				<div className="flex items-center">
					<Label htmlFor="password">Password</Label>
					{linkToResetPassword && (
						<Link
							href="/forgot-password"
							className="ml-auto inline-block text-sm underline"
						>
							Forgot your password?
						</Link>
					)}
				</div>
				<Input id="password" type="password" name="password" required />
			</div>
			{pending ? (
				<Button disabled>loading...</Button>
			) : (
				<Button type="submit" className="w-full">
					{submitText}
				</Button>
			)}
		</div>
	);
};
