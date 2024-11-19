import { getOauthCredential } from "@/app/(auth)/lib";
import { logger } from "@/lib/logger";
import { GoogleAuthentcationPresentation } from "../components/google-authentication-presentation";
import { GoogleConnectionButton } from "../components/google-connection-button";

import {
	buildGoogleUserClient,
	needsAuthorization,
} from "@/services/external/google";

import { TriangleAlert } from "lucide-react";
import { reconnectGoogleIdentity } from "./actions";

export async function GoogleAuthentication() {
	const credential = await getOauthCredential("google");
	logger.debug({ credential }, "google credential");

	if (!credential) {
		return <>{/*·todo·connectbutton·"connect·to·google"·*/}</>;
	}

	const googleClient = buildGoogleUserClient(credential);
	try {
		const googleUser = await googleClient.getUser();
		logger.debug({ googleUser }, "google user");
		return <GoogleAuthentcationPresentation />;
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
