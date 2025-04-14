"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TriangleAlertIcon } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "./login";

export const LoginForm = () => {
	const [authError, formAction] = useFormState(login, null);
	const { pending } = useFormStatus();
	
	return (
		<form action={formAction} className="font-hubot">
			<div className="grid gap-6">
				{authError && (
					<Alert variant="destructive">
						<TriangleAlertIcon className="w-4 h-4" />
						<AlertTitle>Authentication Error</AlertTitle>
						<AlertDescription>
							{authError.message || "An error occurred. Please try again."}
						</AlertDescription>
					</Alert>
				)}
				<div className="grid gap-[16px]">
					<div className="grid gap-[4px]">
						<Label
							htmlFor="email"
							className="text-[14px] font-hubot text-black-70"
						>
							Email
						</Label>
						<input type="hidden" name="email" value="you@example.com" />
						<div className="py-2 text-white-400">
							you@example.com
						</div>
					</div>
					<div className="grid gap-[4px]">
						<div className="grid gap-[4px] relative">
							<Label
								htmlFor="password"
								className="text-[14px] font-hubot text-black-70"
							>
								Password
							</Label>
							<Input
								id="password"
								type="password"
								name="password"
								required
								className={authError && "password" in authError ? "border-red-500" : ""}
							/>
						</div>
					</div>
					<div className="grid gap-[4px]">
						<div className="grid gap-[4px] relative">
							<Label
								htmlFor="confirmPassword"
								className="text-[14px] font-hubot text-black-70"
							>
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								name="confirmPassword"
								required
								className={authError && "confirmPassword" in authError ? "border-red-500" : ""}
							/>
						</div>
					</div>
					<Button
						className="w-full font-medium"
						type="submit"
						disabled={pending}
						data-loading={pending}
					>
						Join to team
					</Button>
				</div>
			</div>
		</form>
	);
};
