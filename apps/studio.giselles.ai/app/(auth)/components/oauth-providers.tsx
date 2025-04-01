import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import type { FC } from "react";
import { authorizeGitHub, authorizeGoogle } from "../actions";

type OauthProvidersProps = {
	labelPrefix: string;
};

export const OAuthProviders: FC<OauthProvidersProps> = ({ labelPrefix }) => (
	<div className="space-y-3">
		<Button 
			asChild 
			className="w-full bg-transparent border border-white-800/20 text-white hover:bg-white-850/10 font-hubot py-3 rounded-lg flex items-center justify-center relative"
		>
			<form className="flex w-full items-center justify-center gap-3">
				<SiGoogle className="h-5 w-5 absolute left-4" />
				<button type="submit" formAction={authorizeGoogle} className="font-hubot">
					{labelPrefix} with Google
				</button>
			</form>
		</Button>

		<Button 
			asChild 
			className="w-full bg-transparent border border-white-800/20 text-white hover:bg-white-850/10 font-hubot py-3 rounded-lg flex items-center justify-center relative"
		>
			<form className="flex w-full items-center justify-center gap-3">
				<svg className="h-5 w-5 absolute left-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
					<path fill="currentColor" d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.211H0V16h7.462V8.211zM16 8.211H8.538V16H16V8.211z"/>
				</svg>
				<button type="submit" className="font-hubot">
					{labelPrefix} with Microsoft
				</button>
			</form>
		</Button>

		<Button 
			asChild 
			className="w-full bg-transparent border border-white-800/20 text-white hover:bg-white-850/10 font-hubot py-3 rounded-lg flex items-center justify-center relative"
		>
			<form className="flex w-full items-center justify-center gap-3">
				<SiGithub className="h-5 w-5 absolute left-4" />
				<button type="submit" formAction={authorizeGitHub} className="font-hubot">
					{labelPrefix} with GitHub
				</button>
			</form>
		</Button>
	</div>
);
