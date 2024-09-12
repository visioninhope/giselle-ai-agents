import type { FC, ReactNode } from "react";

type ActionPromptProps = {
	prompt: string;
	action: ReactNode;
};
export const ActionPrompt: FC<ActionPromptProps> = ({ prompt, action }) => (
	<p className="text-[14px] text-black-30 font-[Rosart]">
		{prompt} {action}
	</p>
);
