"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

export default function SignInPage() {
	return (
		<div className="grid w-full flex-grow items-center bg-background px-4 sm:justify-center">
			<SignIn.Root>
				<SignIn.Step
					name="start"
					className="w-full space-y-6 rounded-2xl bg-background px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
				>
					<header className="text-center">
						<h1 className="mt-4 text-xl font-medium tracking-tight text-foreground">
							Sign in
						</h1>
					</header>
					<Clerk.GlobalError className="block text-sm text-red-400" />
					<div className="space-y-4">
						<Clerk.Field name="identifier" className="space-y-2">
							<Clerk.Label className="text-sm font-medium text-foreground">
								Username
							</Clerk.Label>
							<Clerk.Input asChild>
								<Input type="text" required />
							</Clerk.Input>
							<Clerk.FieldError className="block text-sm text-red-400" />
						</Clerk.Field>
						<Clerk.Field name="password" className="space-y-2">
							<Clerk.Label className="text-sm  font-medium text-foreground">
								Password
							</Clerk.Label>
							<Clerk.Input asChild>
								<Input type="password" required />
							</Clerk.Input>
							<Clerk.FieldError className="block text-sm text-red-400" />
						</Clerk.Field>
					</div>
					<SignIn.Action submit asChild>
						<Button>Sign In</Button>
					</SignIn.Action>
				</SignIn.Step>
			</SignIn.Root>
		</div>
	);
}
