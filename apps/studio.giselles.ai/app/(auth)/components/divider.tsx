import type { FC } from "react";

type DividerProps = {
	label?: string;
};

export const Divider: FC<DividerProps> = ({ label = "or" }) => (
	<div className="relative my-4">
		<div className="absolute inset-0 flex items-center">
			<div className="w-full border-t border-white-800/20" />
		</div>
		{label && (
			<div className="relative flex justify-center">
				<span className="bg-black-100 px-4 text-sm text-white-400 font-hubot">
					{label}
				</span>
			</div>
		)}
	</div>
);
