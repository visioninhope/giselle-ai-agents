import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import type { FC } from "react";

export const OAuthProviders: FC = () => (
	<div className="space-y-2">
		<Button asChild variant="link">
			<Link href="/signup/google">
				<SiGoogle className="h-[20px] w-[20px]" />
				<p>Sign up with Google</p>
			</Link>
		</Button>
		{/**<button
							className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
							type="button"
						>
							<Microsoft className="h-5 w-5 mr-2" /> Sign up with Microsoft
						</button>**/}

		<Button asChild variant="link">
			<Link href="/signup/github">
				<SiGithub className="h-[20px] w-[20px]" />
				<p>Sign up with GitHub</p>
			</Link>
		</Button>
	</div>
);
