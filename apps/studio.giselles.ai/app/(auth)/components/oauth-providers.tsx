import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import type { FC } from "react";
import { authorizeGitHub, authorizeGoogle } from "../actions";
import type { AuthComponentProps } from "../types";
import { ProviderButton } from "./provider-button";

type OauthProvidersProps = AuthComponentProps & {
	labelPrefix: string;
};

export const OAuthProviders: FC<OauthProvidersProps> = ({
	labelPrefix,
	returnUrl,
}) => (
	<div className="space-y-2">
		<ProviderButton
			icon={<SiGoogle className="h-[20px] w-[20px]" />}
			label={`${labelPrefix} with Google`}
			formAction={authorizeGoogle}
			returnUrl={returnUrl}
		/>

		<ProviderButton
			icon={<SiGithub className="h-[20px] w-[20px]" />}
			label={`${labelPrefix} with GitHub`}
			formAction={authorizeGitHub}
			returnUrl={returnUrl}
		/>
	</div>
);
