import { getOauthCredential } from "@/app/(auth)/lib";
import { logger } from "@/lib/logger";
import { getUser } from "@/lib/supabase";
import { GoogleAuthentcationPresentation } from "../components/google-authentication-presentation";
import { GoogleConnectionButton } from "../components/google-connection-button";

import {
	buildGoogleUserClient,
	needsAuthorization,
} from "@/services/external/google";

import { TriangleAlert } from "lucide-react";
import { disconnectGoogleIdentity, reconnectGoogleIdentity } from "./actions";

export async function GoogleAuthentication() {
	const credential = await getOauthCredential("google");
	logger.debug({ credential }, "google credential");

	if (!credential) {
		return <>{/*·todo·connectbutton·"connect·to·google"·*/}</>;
	}

	const googleClient = buildGoogleUserClient(credential);
	try {
		const googleUser = await googleClient.getUser();
		const supabaseUser = await getUser();
		const unlinkable =
			supabaseUser.identities && supabaseUser.identities.length > 1;
		logger.debug({ googleUser }, "google user");
		return (
			<GoogleAuthentcationPresentation
				googleUser={googleUser}
				button={unlinkable ? GoogleDisconnectButton : undefined}
			/>
		);
	} catch (error) {
		if (needsAuthorization(error)) {
			return <GoogleAuthentcationPresentation button={GoogleReconnectButton} />;
		}
		throw error;
	}
}

function GoogleReconnectButton() {
	return (
		<div>
			<GoogleConnectionButton
				action={reconnectGoogleIdentity}
				className="text-yellow-500"
			>
				<TriangleAlert /> Reconnect
			</GoogleConnectionButton>
		</div>
	);
}

function GoogleDisconnectButton() {
	return (
		<GoogleConnectionButton
			action={disconnectGoogleIdentity}
			className="text-red-500"
		>
			Disconnect
		</GoogleConnectionButton>
	);
}
