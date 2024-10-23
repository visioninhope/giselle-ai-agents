import { SparklesIcon } from "../../components/icons/sparkles";

export function RunButton() {
	return (
		<button
			type="button"
			className="px-[16px] py-[8px] rounded-[8px] flex items-center gap-[2px] bg-[hsla(207,19%,77%,0.3)] font-rosart"
			style={{
				boxShadow: "0px 0px 3px 0px hsla(0, 0%, 100%, 0.25) inset",
			}}
		>
			<SparklesIcon className="w-[18px] h-[18px] fill-white drop-shadow-[0.66px_1.32px_2.64px_hsla(0,0%,100%,0.25)]" />
			<span>Run</span>
		</button>
	);
}
