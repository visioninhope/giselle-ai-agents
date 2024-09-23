import type { FC } from "react";
import { TextGenerationIcon } from "../components/icons/text-generation";

type GradientBorderProps = {
	rounded: string;
	from: string;
	to: string;
};
export const GradientBorder: FC<GradientBorderProps> = ({
	rounded,
	from,
	to,
}) => (
	<div
		className={`absolute z-0 ${rounded} inset-0 border mask-fill bg-gradient-to-br bg-origin-border ${from} ${to} bg-clip-boarder border-transparent`}
	/>
);

export const GiselleNode: FC = () => {
	return (
		<div
			className="rounded-[16px] overflow-hidden bg-gradient-to-tl from-[hsla(187,79%,54%,0.2)] to-[hsla(207,100%,9%,0.2)] opacity-50"
			style={{ boxShadow: "0px 0px 16px 0px hsla(187, 79%, 54%, 0.5)" }}
		>
			<GradientBorder
				rounded="rounded-[16px]"
				from="from-[hsla(187,79%,54%,1)]"
				to="to-[hsla(187,68%,30%,1)]"
			/>
			<div className=" bg-[hsla(187,71%,48%,0.3)] px-[12px] py-[8px]">
				<div className="flex items-center gap-[8px]">
					<div
						className="bg-[hsla(187,71%,48%,1)] w-[28px] h-[28px] flex items-center justify-center rounded-[4px]"
						style={{
							boxShadow: "1px 1px 12px 0px hsla(182, 73%, 52%, 0.8)",
						}}
					>
						<TextGenerationIcon className="w-[18px] h-[18px] fill-black-100" />
					</div>
					<div className="font-rosart text-[16px]">Text Generation</div>
				</div>
			</div>
			<div className="px-[8px] py-[8px]">
				<div className="flex justify-between">
					<div className="grid">
						<div className="relative rounded-[20px] overflow-hidden bg-[hsla(30,100%,98%,0.1)] pl-[4px] py-[2px] pr-[8px] flex items-center gap-[2px]">
							<GradientBorder
								rounded="rounded-[20px]"
								from="from-[hsla(185,81%,50%,1)]"
								to="to-[hsla(190,100%,13%,1)]"
							/>
							<div className="w-[10px] h-[10px] bg-black-100 rounded-full border border-[hsla(185,81%,50%,1)]" />
							<div className="text-[10px] text-black--30">instuction</div>
						</div>
					</div>

					<div className="grid">
						<div className="relative rounded-[20px] overflow-hidden bg-[hsla(30,100%,98%,0.1)] pl-[8px] py-[2px] pr-[4px] flex items-center gap-[2px]">
							<GradientBorder
								rounded="rounded-[20px]"
								from="from-[hsla(185,81%,50%,1)]"
								to="to-[hsla(190,100%,13%,1)]"
							/>
							<div className="text-[10px] text-black--30">result</div>
							<div className="w-[10px] h-[10px] bg-black-100 rounded-full border border-[hsla(185,81%,50%,1)]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
