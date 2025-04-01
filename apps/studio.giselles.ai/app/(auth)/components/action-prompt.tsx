import type { FC, ReactNode } from "react";

type ActionPromptProps = {
	prompt: string;
	action: ReactNode;
};

export const ActionPrompt: FC<ActionPromptProps> = ({ prompt, action }) => (
	<div className="flex items-center gap-2 justify-center">
		<span className="text-white-400 font-hubot text-sm">{prompt}</span>
		{action}
	</div>
);
