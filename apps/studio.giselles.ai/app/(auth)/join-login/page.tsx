import Link from "next/link";

// Page for logged-in users who have been invited to join a team
export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 gap-16">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-[24px]">
					<div className="text-center">
						<p className="text-white-400 mb-2">
							You have been invited to join
						</p>
						<h2
							className="text-[28px] font-[500] text-primary-100 font-hubot"
							style={{ textShadow: "0px 0px 20px #0087F6" }}
						>
							Team name
						</h2>
					</div>
					<div className="grid gap-[16px]">
						<div className="py-4">
							<div className="py-2 text-white-400">
								you@example.com
							</div>
							<p className="text-white mt-4 text-center">
								You are logged in as the user above. Would you like to join this team?
							</p>
						</div>
						
						<button
							className="w-full font-medium bg-blue-200 text-blue-950 rounded-md py-2 px-4 hover:bg-blue-300 transition-colors"
							onClick={() => alert('Join team functionality would be implemented here')}
						>
							Join to team
						</button>
						
						<div className="text-sm text-center text-white-400 mt-4">
							By continuing, you agree to our <Link href="/terms" className="text-blue-300 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-300 hover:underline">Privacy Policy</Link>.
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
