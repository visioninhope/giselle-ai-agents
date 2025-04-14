"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

// Page for logged-in users who have been invited to join a team
export default function Page() {
	const [joining, setJoining] = useState(false);

	const handleJoin = () => {
		setJoining(true);
		// In actual implementation, call the team join API here
		setTimeout(() => {
			alert("Join team functionality would be implemented here");
			setJoining(false);
		}, 500);
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<div className="text-center">
						<p className="text-slate-400 mb-2">You have been invited to join</p>
						<h2
							className="text-[28px] font-[500] text-primary-100 font-hubot"
							style={{ textShadow: "0px 0px 20px #0087F6" }}
						>
							Team name
						</h2>
					</div>
					<div className="grid gap-[16px]">
						<Button
							className="w-full font-medium"
							onClick={handleJoin}
							disabled={joining}
							data-loading={joining}
						>
							{joining ? "Joining..." : "Join to team"}
						</Button>

						<div className="text-sm text-center text-slate-400 mt-4">
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

						<div className="flex justify-center mt-4">
							<Link
								href="#"
								className="text-white hover:text-white/80 underline"
							>
								Decline
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
