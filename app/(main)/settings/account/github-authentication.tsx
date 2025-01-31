"use server";

import { getGitHubIdentityState } from "@/services/accounts";
import { TriangleAlert } from "lucide-react";
import { GitHubAuthenticationPresentation } from "../components/github-authentication-presentation";
import { ProviderConnectionButton } from "../components/provider-connection-button";
import {
	connectGitHubIdentity,
	disconnectGitHubIdentity,
	reconnectGitHubIdentity,
} from "./actions";

export async function GitHubAuthentication() {
	const identityState = await getGitHubIdentityState();

	if (identityState.state === "unauthorized") {
		return <GitHubAuthenticationPresentation button={GitHubConnectButton} />;
	}
	if (identityState.state === "invalid-credential") {
		return <GitHubAuthenticationPresentation button={GitHubReconnectButton} />;
	}

	return (
		<GitHubAuthenticationPresentation
			gitHubUser={identityState.gitHubUser}
			button={identityState.unlinkable ? GitHubDisconnectButton : undefined}
		/>
	);
}

function GitHubConnectButton() {
	return (
		<ProviderConnectionButton action={connectGitHubIdentity}>
			Connect
		</ProviderConnectionButton>
	);
}

function GitHubReconnectButton() {
	return (
		<div>
			<ProviderConnectionButton
				action={reconnectGitHubIdentity}
				className="text-yellow-500"
			>
				<TriangleAlert /> Reconnect
			</ProviderConnectionButton>
		</div>
	);
}

function GitHubDisconnectButton() {
	return (
		<ProviderConnectionButton
			action={disconnectGitHubIdentity}
			className="text-red-500"
		>
			Disconnect
		</ProviderConnectionButton>
	);
}
