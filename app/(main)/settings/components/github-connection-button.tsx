import { Button } from "@/components/ui/button";

export type GitHubConnectButtonMode = "connect" | "disconnect" | "hidden";

export function GitHubConnectButton({
	mode,
	connectAction,
	disconnectAction,
}: {
	mode: GitHubConnectButtonMode;
	connectAction: () => Promise<void>;
	disconnectAction: () => Promise<void>;
}) {
	const className = "w-fit font-avenir text-sm font-medium";
	switch (mode) {
		case "connect":
			return (
				<form>
					<Button
						className={className}
						type="submit"
						formAction={connectAction}
					>
						Connect
					</Button>
				</form>
			);
		case "disconnect":
			return (
				<form>
					<Button
						className={className}
						type="submit"
						formAction={disconnectAction}
					>
						Disconnect
					</Button>
				</form>
			);
		case "hidden":
			return null;
	}
}
