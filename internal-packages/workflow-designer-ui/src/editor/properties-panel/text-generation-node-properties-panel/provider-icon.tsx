import { AnthropicIcon, GoogleIcon, OpenaiIcon } from "../../../icons";

type Provider = "openai" | "anthropic" | "google" | "perplexity";

export function ProviderIcon({ provider }: { provider: Provider }) {
	switch (provider) {
		case "openai":
			return <OpenaiIcon className="size-[20px] text-inverse" />;
		case "anthropic":
			return <AnthropicIcon className="size-[20px] text-inverse" />;
		case "google":
			return <GoogleIcon className="size-[20px]" />;
		case "perplexity":
			// Perplexity is deprecated, show OpenAI icon as fallback
			return <OpenaiIcon className="size-[20px] text-inverse" />;
		default: {
			const _exhaustiveCheck: never = provider;
			throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
		}
	}
}
