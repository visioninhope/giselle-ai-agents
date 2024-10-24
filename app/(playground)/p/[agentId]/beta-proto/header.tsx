import { GiselleLogo } from "@/components/giselle-logo";
import Link from "next/link";
import { SparklesIcon } from "./components/icons/sparkles";
import { ModeButton } from "./components/mode-button";
import { useFeatureFlags } from "./feature-flags/context";
import { useGraph } from "./graph/context";
import { playgroundModes } from "./graph/types";

export function Header() {
	const { viewFlag } = useFeatureFlags();
	return (
		<div className="h-[60px] flex items-center justify-between mx-[20px]">
			<div className="flex gap-[8px] items-center">
				<Link href="/">
					<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
				</Link>
				<div className="font-rosart text-[18px] text-black--30">Playground</div>
				{/**
									<div className="flex items-center gap-[10px] group">
										<label className="w-[30px] h-[18px] border border-black-70 rounded-full relative bg-black-80 cursor-pointer group has-[:checked]:bg-black-70 ">
											<div className="absolute bg-black-100 rounded-full w-[16px] h-[16px] group-has-[:checked]:translate-x-[12px]  transition-all" />
											<input type="checkbox" name="previewMode" className="hidden" />
										</label>
										<div className="relative font-avenir h-[18px] text-[12px]">
											<div className="h-[18px] flex items-center absolute top-0 text-black--30 opacity-100 group-has-[:checked]:opacity-0 transition-opacity duration-400">
												Edit
											</div>
											<div className="h-[18px] flex items-center  absolute text-black--30 opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-400">
												Preview
											</div>
										</div>
									</div>
								 */}
			</div>
			{viewFlag && (
				<div className="flex items-center gap-[10px]">
					<ModeButton mode={playgroundModes.edit}>edit</ModeButton>
					<ModeButton mode={playgroundModes.view}>view</ModeButton>
				</div>
			)}
			{viewFlag && (
				<div>
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
				</div>
			)}
		</div>
	);
}
