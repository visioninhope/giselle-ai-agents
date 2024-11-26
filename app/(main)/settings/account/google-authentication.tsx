import { getOauthCredential } from "@/app/(auth)/lib";
import { logger } from "@/lib/logger";
import { getUser } from "@/lib/supabase";
import { GoogleAuthenticationPresentation } from "../components/google-authentication-presentation";
import { ProviderConnectionButton } from "../components/provider-connection-button";

import {
	buildGoogleUserClient,
	needsAuthorization,
} from "@/services/external/google";

import { TriangleAlert } from "lucide-react";
import {
	connectGoogleIdentity,
	disconnectGoogleIdentity,
	reconnectGoogleIdentity,
} from "./actions";

const provider = "google";

export async function GoogleAuthentication() {
	const credential = await getOauthCredential(provider);

	if (!credential) {
		return <GoogleAuthenticationPresentation button={GoogleConnectButton} />;
	}
	logger.debug({ credential }, "google credential");

	const googleClient = buildGoogleUserClient(credential);
	try {
		const googleUser = await googleClient.getUser();
		const supabaseUser = await getUser();
		const unlinkable =
			supabaseUser.identities && supabaseUser.identities.length > 1;
		logger.debug({ googleUser }, "google user");
		return (
			<GoogleAuthenticationPresentation
				googleUser={googleUser}
				button={unlinkable ? GoogleDisconnectButton : undefined}
			/>
		);
	} catch (error) {
		if (needsAuthorization(error)) {
			return (
				<GoogleAuthenticationPresentation
					button={GoogleReconnectButton}
					alert="Your GitHub access token has expired or become invalid. Please reconnect to continue using the service."
				/>
			);
		}
		throw error;
	}
}

function GoogleConnectButton() {
	return (
		<ProviderConnectionButton action={connectGoogleIdentity}>
			Connect
		</ProviderConnectionButton>
	);
}

function GoogleReconnectButton() {
	return (
		<div>
			<ProviderConnectionButton
				action={reconnectGoogleIdentity}
				className="text-yellow-500"
			>
				<TriangleAlert /> Reconnect
			</ProviderConnectionButton>
		</div>
	);
}

function GoogleDisconnectButton() {
	return (
		<ProviderConnectionButton
			action={disconnectGoogleIdentity}
			className="text-red-500"
		>
			Disconnect
		</ProviderConnectionButton>
	);
}
