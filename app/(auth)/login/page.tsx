import Link from "next/link";
import { LoginForm } from "./login-form";

export default function Page() {
	return (
		<div className="flex items-center justify-center py-12">
			<div className="mx-auto grid w-[350px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-bold">Login</h1>
					<p className="text-balance text-muted-foreground">
						Enter your email below to login to your account
					</p>
				</div>
				<LoginForm />
				<div className="mt-4 text-center text-sm">
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="underline">
						Sign up
					</Link>
				</div>
			</div>
		</div>
	);
}
