import { getUser } from "@/lib/supabase";
import {
	type GoogleUserClient,
	type GoogleUserData,
	buildGoogleUserClient,
	needsAuthorization,
} from "../external/google";
import { getOauthCredential } from "./oauth-credentials";

type GoogleIdentityState =
	| GoogleIdentityStateUnauthorized
	| GoogleIdentityStateInvalidCredential
	| GoogleIdentityStateAuthorized;

type GoogleIdentityStateUnauthorized = {
	state: "unauthorized";
};

type GoogleIdentityStateInvalidCredential = {
	state: "invalid-credential";
};

type GoogleIdentityStateAuthorized = {
	state: "authorized";
	googleUser: GoogleUserData;
	googleUserClient: GoogleUserClient;
	unlinkable: boolean;
};

export async function getGoogleIdentityState(): Promise<GoogleIdentityState> {
	const credential = await getOauthCredential("google");
	if (!credential) {
		return { state: "unauthorized" };
	}

	const googleUserClient = buildGoogleUserClient(credential);
	try {
		const googleUser = await googleUserClient.getUser();
		const supabaseUser = await getUser();
		const unlinkable =
			(supabaseUser.identities && supabaseUser.identities.length > 1) ?? false;

		return { state: "authorized", googleUser, googleUserClient, unlinkable };
	} catch (error) {
		if (needsAuthorization(error)) {
			return { state: "invalid-credential" };
		}
		throw error;
	}
}
