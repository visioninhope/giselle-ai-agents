import Link from "next/link";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useActionState } from "react";
import { Form } from "../components";
import { signup } from "./actions";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export default function Page() {
	async function createAccount(
		prevState: string | null | void,
		formData: FormData,
	) {
		"use server";
		await sleep(2000);
		cookies().set("email", formData.get("email") as string, {
			httpOnly: true,
			secure: true,
			expires: 0,
		});

		redirect("/onboarding/verify-email");
		return "";
	}
	function a() {}
	const [message, action] = useActionState(a, null);
	return (
		<div className="flex items-center justify-center py-12">
			<div className="mx-auto grid w-[350px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold">Sign up</h1>
					<p className="text-balance text-muted-foreground">
						Enter your information to create an account
					</p>
				</div>
				<form action={action}>
					<Form />
				</form>
				<div className="mt-4 text-center text-sm">
					Already have an account?{" "}
					<Link href="/login" className="underline">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
