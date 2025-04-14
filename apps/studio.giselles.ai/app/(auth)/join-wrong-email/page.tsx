"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Page for logged-in users who have been invited with a different email
export default function Page() {
	const [joining, setJoining] = useState(false);
	const router = useRouter();
	
	const handleSignOut = () => {
		setJoining(true);
		// In actual implementation, sign out the user and redirect
		setTimeout(() => {
			router.push("/join");
		}, 500);
	};
	
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<div className="text-center">
						<p className="text-slate-400 mb-2 text-sm">
							You have been invited to join
						</p>
						<h2
							className="text-[24px] font-[500] text-primary-100 font-hubot"
							style={{ textShadow: "0px 0px 20px #0087F6" }}
						>
							Team name
						</h2>
					</div>
					<div className="grid gap-[16px]">
						<div className="text-white text-center p-4 text-sm">
							The email address you're currently using doesn't match the email
							this invitation was intended for. To join this workspace, please
							sign out and then either sign in with the email address specified
							in the invitation or create a new account using that email
							address.
						</div>
						
						<Button
							className="w-full font-medium"
							onClick={handleSignOut}
							disabled={joining}
							data-loading={joining}
						>
							{joining ? "Signing out..." : "Sign out"}
						</Button>
						
						<div className="text-xs text-center text-slate-400 mt-4">
							By continuing, you agree to our{" "}
							<Link href="/terms" className="text-blue-300 hover:underline">
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className="text-blue-300 hover:underline">
								Privacy Policy
							</Link>
							.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
