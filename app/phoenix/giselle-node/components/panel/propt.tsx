import type { FC } from "react";

export const PromptPropertyPanel: FC = () => (
	<div>
		<form className="relative z-10">
			<fieldset className="grid gap-[8px]">
				<label htmlFor="text" className="font-rosart text-[16px] text-black-30">
					Text
				</label>
				<textarea
					name="text"
					id="text"
					className="w-full text-[14px] h-[123px] bg-[hsla(222,21%,40%,0.3)] rounded-[8px] text-white p-[8px] font-rosart outline-none"
				/>
			</fieldset>
		</form>
	</div>
);
